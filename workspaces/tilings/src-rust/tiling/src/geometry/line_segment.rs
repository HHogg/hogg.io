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
    let mut min = Point::at(0.0, 0.0);
    let mut max = Point::at(0.0, 0.0);

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

    BBox::from_min_max(min, max)
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

  pub fn set_length(&self, length: f64, origin: LineSegmentOrigin) -> Self {
    let dx = self.p2.x - self.p1.x;
    let dy = self.p2.y - self.p1.y;
    let theta = dy.atan2(dx);

    let mut p1 = self.p1;
    let mut p2 = self.p2;

    match origin {
      LineSegmentOrigin::Start => {
        p2.x = self.p1.x + length * theta.cos();
        p2.y = self.p1.y + length * theta.sin();
      }
      LineSegmentOrigin::Middle => {
        let half_length = length / 2.0;

        p1.x = self.p2.x - half_length * theta.cos();
        p1.y = self.p2.y - half_length * theta.sin();
        p2.x = self.p1.x + half_length * theta.cos();
        p2.y = self.p1.y + half_length * theta.sin();
      }
      LineSegmentOrigin::End => {
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

  pub fn scale(&self, scale: f64) -> Self {
    Self::default()
      .with_start(self.p1.scale(scale))
      .with_end(self.p2.scale(scale))
  }

  pub fn extend_to_bbox(&self, bbox: &BBox, extend_start: bool, extend_end: bool) -> Self {
    let bbox_min = bbox.min();
    let bbox_max = bbox.max();

    let (x1, y1, x2, y2) = extend_line_segment(
      (self.p1.x, self.p1.y, self.p2.x, self.p2.y),
      (bbox_min.x, bbox_min.y, bbox_max.x, bbox_max.y),
      extend_start,
      extend_end,
    );

    Self::default()
      .with_start(Point::at(x1, y1))
      .with_end(Point::at(x2, y2))
  }

  pub fn intersects(&self, other: &LineSegment) -> bool {
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

  // pub fn intersects_bbox(&self, other: &BBox) -> bool {
  //   let top_line_segment = LineSegment::default()
  //     .with_start(other.min)
  //     .with_end(Point::at(other.max.x, other.min.y));
  //   let right_line_segment = LineSegment::default()
  //     .with_start(Point::at(other.max.x, other.min.y))
  //     .with_end(other.max);
  //   let bottom_line_segment = LineSegment::default()
  //     .with_start(other.max)
  //     .with_end(Point::at(other.min.x, other.max.y));
  //   let left_line_segment = LineSegment::default()
  //     .with_start(other.min)
  //     .with_end(Point::at(other.min.x, other.max.y));

  //   self.intersects(&top_line_segment)
  //     || self.intersects(&right_line_segment)
  //     || self.intersects(&bottom_line_segment)
  //     || self.intersects(&left_line_segment)
  // }
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
    self.p1 == other.p1 && self.p2 == other.p2
  }
}

impl From<LineSegment> for Vec<Point> {
  fn from(line_segment: LineSegment) -> Self {
    vec![line_segment.p1, line_segment.p2]
  }
}
