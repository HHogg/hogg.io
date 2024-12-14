#[path = "./line_segment_tests.rs"]
#[cfg(test)]
mod tests;

use std::cmp::Ordering;

use line_segment_extending::extend_line_segment;
use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use super::point::Point;
use super::BBox;
use crate::utils::math::{compare_coordinate, compare_radians};

fn get_point_at_percentage(p1: Point, p2: Point, percentage: f64, offset: f64) -> Point {
  let x = p1.x + (p2.x - p1.x) * percentage + offset;
  let y = p1.y + (p2.y - p1.y) * percentage + offset;

  Point::at(x, y)
}

pub enum LineSegmentOrigin {
  Start,
  Middle,
  End,
}

#[derive(Clone, Copy, Debug, Default, Deserialize, Serialize)]
#[typeshare]
pub struct LineSegment {
  pub start: Point,
  pub end: Point,
}

impl LineSegment {
  pub fn with_start(mut self, p1: Point) -> Self {
    self.start = p1;
    self
  }

  pub fn with_end(mut self, p2: Point) -> Self {
    self.end = p2;
    self
  }

  pub fn bbox(&self) -> BBox {
    let mut min = Point::at(0.0, 0.0);
    let mut max = Point::at(0.0, 0.0);

    if self.start.x < self.end.x {
      min.x = self.start.x;
      max.x = self.end.x;
    } else {
      min.x = self.end.x;
      max.x = self.start.x;
    }

    if self.start.y < self.end.y {
      min.y = self.start.y;
      max.y = self.end.y;
    } else {
      min.y = self.end.y;
      max.y = self.start.y;
    }

    BBox::from_min_max(min, max)
  }

  pub fn mid_point(&self) -> Point {
    get_point_at_percentage(self.start, self.end, 0.5, 0.0)
  }

  pub fn length(&self) -> f64 {
    self.start.distance_to(&self.end)
  }

  pub fn theta(&self) -> f64 {
    self.end.radian_to(&self.start)
  }

  pub fn flip(&self) -> Self {
    Self::default().with_start(self.end).with_end(self.start)
  }

  pub fn is_connected(&self, other: &Self) -> bool {
    self.end == other.start
  }

  pub fn get_point_delta(&self, point: &Point) -> isize {
    let x = point.x;
    let y = point.y;
    let x0 = self.start.x;
    let y0 = self.start.y;
    let x1 = self.end.x;
    let y1 = self.end.y;

    let pos = (y - y0) * (x1 - x0) - (x - x0) * (y1 - y0);

    match compare_coordinate(pos, 0.0) {
      Ordering::Less => -1,
      Ordering::Greater => 1,
      _ => 0,
    }
  }

  pub fn get_point_at_percentage(&self, percentage: f64, offset: f64) -> Point {
    get_point_at_percentage(self.start, self.end, percentage, offset)
  }

  pub fn set_length(&self, length: f64, origin: LineSegmentOrigin) -> Self {
    let dx = self.end.x - self.start.x;
    let dy = self.end.y - self.start.y;
    let theta = dy.atan2(dx);

    let mut p1 = self.start;
    let mut p2 = self.end;

    match origin {
      LineSegmentOrigin::Start => {
        p2.x = self.start.x + length * theta.cos();
        p2.y = self.start.y + length * theta.sin();
      }
      LineSegmentOrigin::Middle => {
        let half_length = length / 2.0;

        p1.x = self.end.x - half_length * theta.cos();
        p1.y = self.end.y - half_length * theta.sin();
        p2.x = self.start.x + half_length * theta.cos();
        p2.y = self.start.y + half_length * theta.sin();
      }
      LineSegmentOrigin::End => {
        p1.x = self.end.x - length * theta.cos();
        p1.y = self.end.y - length * theta.sin();
      }
    }

    Self::default().with_start(p1).with_end(p2)
  }

  pub fn rotate(&self, theta: f64, origin: Option<&Point>) -> Self {
    let mid_point = self.mid_point();
    let origin = origin.or(Some(&mid_point));

    Self::default()
      .with_start(self.start.rotate(theta, origin))
      .with_end(self.end.rotate(theta, origin))
  }

  pub fn scale(&self, scale: f64) -> Self {
    Self::default()
      .with_start(self.start.scale(scale))
      .with_end(self.end.scale(scale))
  }

  pub fn extend_to_bbox(&self, bbox: &BBox, extend_start: bool, extend_end: bool) -> Self {
    let bbox_min = bbox.min();
    let bbox_max = bbox.max();

    let (x1, y1, x2, y2) = extend_line_segment(
      (self.start.x, self.start.y, self.end.x, self.end.y),
      (bbox_min.x, bbox_min.y, bbox_max.x, bbox_max.y),
      extend_start,
      extend_end,
    );

    Self::default()
      .with_start(Point::at(x1, y1))
      .with_end(Point::at(x2, y2))
  }

  pub fn get_intersection_point(&self, other: &LineSegment) -> Option<Point> {
    // If any of the points are the same, then we say
    // they don't intersect. This is because line segments
    // make up shapes, and 2 sibling line segments would share
    // the same point, so we don't want to count that as an
    // intersection
    if self.start == other.start || self.start == other.end {
      return Some(self.start);
    }

    if self.end == other.start || self.end == other.end {
      return Some(self.end);
    }

    let a = self.start.x;
    let b = self.start.y;
    let c = self.end.x;
    let d = self.end.y;
    let p = other.start.x;
    let q = other.start.y;
    let r = other.end.x;
    let s = other.end.y;

    let denominator = (c - a) * (s - q) - (r - p) * (d - b);

    if denominator == 0.0 {
      return None;
    }

    let y_numerator = ((s - q) * (r - a) + (p - r) * (s - b)) / denominator;
    let x_numerator = ((b - d) * (r - a) + (c - a) * (s - b)) / denominator;

    if (0.0 < y_numerator) && (y_numerator < 1.0) && (0.0 < x_numerator) && (x_numerator < 1.0) {
      return Some(Point::at(
        a + x_numerator * (c - a),
        b + y_numerator * (d - b),
      ));
    }

    None
  }

  pub fn is_intersection_with_polygon_line_segment(&self, other: &LineSegment) -> bool {
    let intersection_point = self.get_intersection_point(other);

    match intersection_point {
      Some(p) if p == self.start => false,
      Some(p) if p == self.end => false,
      Some(_) => true,
      None => false,
    }
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

impl Eq for LineSegment {}

impl PartialEq for LineSegment {
  fn eq(&self, other: &Self) -> bool {
    self.start == other.start && self.end == other.end
  }
}

impl From<LineSegment> for Vec<Point> {
  fn from(line_segment: LineSegment) -> Self {
    vec![line_segment.start, line_segment.end]
  }
}
