#[path = "./line_segment_tests.rs"]
#[cfg(test)]
mod tests;

use std::cmp::Ordering;
use std::f64::consts::PI;
use std::hash::{Hash, Hasher};

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use super::point::Point;
use super::BBox;
use crate::math::{compare_coordinate, compare_radians, coordinate_equals};

fn get_point_at_percentage(p1: Point, p2: Point, percentage: f64, offset: f64) -> Point {
  let x = p1.x + (p2.x - p1.x) * percentage + offset;
  let y = p1.y + (p2.y - p1.y) * percentage + offset;

  Point::default().with_xy(x, y)
}

pub enum Origin {
  Start,
  Middle,
  End,
}

#[derive(Clone, Copy, Debug, Default, Deserialize, Serialize)]
#[typeshare]
pub struct LineSegment {
  pub p1: Point,
  pub p2: Point,
}

impl LineSegment {
  pub fn with_start(mut self, p1: Point) -> Self {
    self.p1 = p1;
    self
  }

  pub fn with_end(mut self, p2: Point) -> Self {
    self.p2 = p2;
    self
  }

  pub fn bbox(&self) -> BBox {
    let mut min = Point::default().with_xy(0.0, 0.0);
    let mut max = Point::default().with_xy(0.0, 0.0);

    if self.p1.x < self.p2.x {
      min.x = self.p1.x;
      max.x = self.p2.x;
    } else {
      min.x = self.p2.x;
      max.x = self.p1.x;
    }

    if self.p1.y < self.p2.y {
      min.y = self.p1.y;
      max.y = self.p2.y;
    } else {
      min.y = self.p2.y;
      max.y = self.p1.y;
    }

    BBox { min, max }
  }

  pub fn mid_point(&self) -> Point {
    get_point_at_percentage(self.p1, self.p2, 0.5, 0.0)
  }

  pub fn length(&self) -> f64 {
    self.p1.distance_to(&self.p2)
  }

  pub fn theta(&self) -> f64 {
    self.p2.radian_to(&self.p1)
  }

  pub fn flip(&self) -> Self {
    Self::default().with_start(self.p2).with_end(self.p1)
  }

  pub fn is_connected(&self, other: &Self) -> bool {
    self.p2 == other.p1
  }

  pub fn get_point_delta(&self, point: &Point) -> isize {
    let x = point.x;
    let y = point.y;
    let x0 = self.p1.x;
    let y0 = self.p1.y;
    let x1 = self.p2.x;
    let y1 = self.p2.y;

    let pos = (y - y0) * (x1 - x0) - (x - x0) * (y1 - y0);

    match compare_coordinate(pos, 0.0) {
      Ordering::Less => -1,
      Ordering::Greater => 1,
      _ => 0,
    }
  }

  pub fn get_point_at_percentage(&self, percentage: f64, offset: f64) -> Point {
    get_point_at_percentage(self.p1, self.p2, percentage, offset)
  }

  pub fn set_length(&self, length: f64, origin: Origin) -> Self {
    let dx = self.p2.x - self.p1.x;
    let dy = self.p2.y - self.p1.y;
    let theta = dy.atan2(dx);

    let mut p1 = self.p1;
    let mut p2 = self.p2;

    match origin {
      Origin::Start => {
        p2.x = self.p1.x + length * theta.cos();
        p2.y = self.p1.y + length * theta.sin();
      }
      Origin::Middle => {
        let half_length = length / 2.0;

        p1.x = self.p2.x - half_length * theta.cos();
        p1.y = self.p2.y - half_length * theta.sin();
        p2.x = self.p1.x + half_length * theta.cos();
        p2.y = self.p1.y + half_length * theta.sin();
      }
      Origin::End => {
        p1.x = self.p2.x - length * theta.cos();
        p1.y = self.p2.y - length * theta.sin();
      }
    }

    Self::default().with_start(p1).with_end(p2)
  }

  pub fn rotate(&self, theta: f64, origin: Option<&Point>) -> Self {
    let mid_point = self.mid_point();
    let origin = origin.or(Some(&mid_point));

    Self::default()
      .with_start(self.p1.rotate(theta, origin))
      .with_end(self.p2.rotate(theta, origin))
  }

  pub fn extend_to_bbox(&self, bbox: &BBox, extend_start: bool, extend_end: bool) -> Self {
    let mut x1 = self.p1.x;
    let mut y1 = self.p1.y;
    let mut x2 = self.p2.x;
    let mut y2 = self.p2.y;
    let min_x = bbox.min.x;
    let min_y = bbox.min.y;
    let max_x = bbox.max.x;
    let max_y = bbox.max.y;

    let dx = x2 - x1;
    let dy = y2 - y1;
    let is_horizontal = coordinate_equals(dy, 0.0);
    let is_vertical = coordinate_equals(dx, 0.0);

    // For cases where the line is horizontal or vertical,
    // we can just use the min/max values of the bbox, and
    // we can avoid any division by zero errors
    if is_horizontal || is_vertical {
      if is_horizontal {
        if x1 < x2 {
          if extend_start {
            x1 = min_x;
          }

          if extend_end {
            x2 = max_x
          }
        } else {
          if extend_start {
            x1 = max_x;
          }

          if extend_end {
            x2 = min_x
          }
        }
      }

      if is_vertical {
        if y1 < y2 {
          if extend_start {
            y1 = min_y;
          }

          if extend_end {
            y2 = max_y
          }
        } else {
          if extend_start {
            y1 = max_y;
          }

          if extend_end {
            y2 = min_y
          }
        }
      }

      return Self::default()
        .with_start(Point::default().with_xy(x1, y1))
        .with_end(Point::default().with_xy(x2, y2));
    }

    let m = dy / dx;
    let b = y1 - m * x1;
    let x = |y: f64| (y - b) / m;
    let y = |x: f64| m * x + b;

    let x_for_min_y = x(min_y);
    let x_for_max_y = x(max_y);
    let y_for_min_x = y(min_x);
    let y_for_max_x = y(max_x);

    let intercepts_min_y = x_for_min_y >= min_x && x_for_min_y <= max_x;
    let intercepts_max_y = x_for_max_y >= min_x && x_for_max_y <= max_x;
    let intercepts_min_x = y_for_min_x >= min_y && y_for_min_x <= max_y;
    let intercepts_max_x = y_for_max_x >= min_y && y_for_max_x <= max_y;

    let cx = (x1 + x2) * 0.5;
    let cy = (y1 + y2) * 0.5;

    let atan_p1 = (y1 - cy).atan2(x1 - cx);
    let atan_p2 = (y2 - cy).atan2(x2 - cx);

    if intercepts_min_y {
      if extend_start && atan_p1 < 0.0 {
        x1 = x_for_min_y;
        y1 = min_y;
      } else if extend_end && atan_p2 < 0.0 {
        x2 = x_for_min_y;
        y2 = min_y;
      }
    }

    if intercepts_max_y {
      if extend_start && atan_p1 > 0.0 {
        x1 = x_for_max_y;
        y1 = max_y;
      } else if extend_end && atan_p2 > 0.0 {
        x2 = x_for_max_y;
        y2 = max_y;
      }
    }

    if intercepts_min_x {
      if extend_start && !(PI * -0.5..=PI * 0.5).contains(&atan_p1) {
        x1 = min_x;
        y1 = y_for_min_x;
      } else if extend_end && !(PI * -0.5..=PI * 0.5).contains(&atan_p2) {
        x2 = min_x;
        y2 = y_for_min_x;
      }
    }

    if intercepts_max_x {
      if extend_start && (atan_p1 > PI * -0.5 && atan_p1 < PI * 0.5) {
        x1 = max_x;
        y1 = y_for_max_x;
      } else if extend_end && (atan_p2 > PI * -0.5 && atan_p2 < PI * 0.5) {
        x2 = max_x;
        y2 = y_for_max_x;
      }
    }

    Self::default()
      .with_start(Point::default().with_xy(x1, y1))
      .with_end(Point::default().with_xy(x2, y2))
  }

  pub fn intersects_bbox(&self, other: &BBox) -> bool {
    let top_line_segment = LineSegment::default()
      .with_start(other.min)
      .with_end(Point::default().with_xy(other.max.x, other.min.y));
    let right_line_segment = LineSegment::default()
      .with_start(Point::default().with_xy(other.max.x, other.min.y))
      .with_end(other.max);
    let bottom_line_segment = LineSegment::default()
      .with_start(other.max)
      .with_end(Point::default().with_xy(other.min.x, other.max.y));
    let left_line_segment = LineSegment::default()
      .with_start(other.min)
      .with_end(Point::default().with_xy(other.min.x, other.max.y));

    self.intersects_line_segment(&top_line_segment)
      || self.intersects_line_segment(&right_line_segment)
      || self.intersects_line_segment(&bottom_line_segment)
      || self.intersects_line_segment(&left_line_segment)
  }

  pub fn intersects_line_segment(&self, other: &LineSegment) -> bool {
    // If any of the points are the same, then we say
    // they don't intersect. This is because line segments
    // make up shapes, and 2 sibling line segments would share
    // the same point, so we don't want to count that as an
    // intersection
    if self.p1 == other.p1 || self.p1 == other.p2 || self.p2 == other.p1 || self.p2 == other.p2 {
      return false;
    }

    let a = self.p1.x;
    let b = self.p1.y;
    let c = self.p2.x;
    let d = self.p2.y;
    let p = other.p1.x;
    let q = other.p1.y;
    let r = other.p2.x;
    let s = other.p2.y;

    let denominator = (c - a) * (s - q) - (r - p) * (d - b);

    if denominator == 0.0 {
      return false;
    }

    let y_numerator = ((s - q) * (r - a) + (p - r) * (s - b)) / denominator;
    let x_numerator = ((b - d) * (r - a) + (c - a) * (s - b)) / denominator;

    (0.0 < y_numerator) && (y_numerator < 1.0) && (0.0 < x_numerator) && (x_numerator < 1.0)
  }
}

impl Ord for LineSegment {
  fn cmp(&self, other: &Self) -> Ordering {
    let self_midpoint = self.mid_point();
    let other_midpoint = other.mid_point();

    // Custom behaviour to handle
    if compare_radians(self.theta(), 0.0).is_eq() {
      if compare_radians(other.theta(), 0.0).is_eq() {
        return compare_coordinate(
          other_midpoint.distance_to_center(),
          self_midpoint.distance_to_center(),
        );
      }

      return Ordering::Greater;
    }

    let theta_comparison = compare_radians(self.mid_point().theta(), other.mid_point().theta());

    if theta_comparison.is_ne() {
      return theta_comparison;
    }

    compare_coordinate(
      other_midpoint.distance_to_center(),
      self_midpoint.distance_to_center(),
    )
  }
}

impl PartialOrd for LineSegment {
  fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
    Some(self.cmp(other))
  }
}

impl Hash for LineSegment {
  fn hash<H: Hasher>(&self, state: &mut H) {
    self.p1.hash(state);
    self.p2.hash(state);
  }
}

impl Eq for LineSegment {}

impl PartialEq for LineSegment {
  fn eq(&self, other: &Self) -> bool {
    self.p1 == other.p1 && self.p2 == other.p2
  }
}

impl From<LineSegment> for Vec<Point> {
  fn from(line_segment: LineSegment) -> Self {
    vec![line_segment.p1, line_segment.p2]
  }
}
