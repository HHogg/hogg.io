#[path = "./point_tests.rs"]
#[cfg(test)]
mod point_tests;

use std::cmp::Ordering;
use std::fmt::{self, Display};
use std::hash::{Hash, Hasher};

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use crate::math::{
  compare_coordinate,
  compare_radians,
  coordinate_equals,
  normalize_radian,
  round_coordinate,
};

#[derive(Clone, Copy, Debug, Default, Deserialize, Serialize)]
#[typeshare]
pub struct Point {
  pub x: f64,
  pub y: f64,

  pub vertex_type: Option<u8>,
}

impl Point {
  pub fn with_xy(self, x: f64, y: f64) -> Self {
    self.with_x(x).with_y(y)
  }

  pub fn with_x(mut self, x: f64) -> Self {
    self.x = x;
    self
  }

  pub fn with_y(mut self, y: f64) -> Self {
    self.y = y;
    self
  }

  pub fn theta(&self) -> f64 {
    self.radian_to(&Self::default().with_xy(0.0, 0.0))
  }

  pub fn abs(&self) -> Self {
    Self::default().with_xy(self.x.abs(), self.y.abs())
  }

  pub fn distance_to(&self, point: &Self) -> f64 {
    (point.x - self.x).hypot(point.y - self.y)
  }

  pub fn distance_to_center(&self) -> f64 {
    self.distance_to(&Self::default().with_xy(0.0, 0.0))
  }

  pub fn radian_to(&self, point: &Self) -> f64 {
    let x = self.x - point.x;
    let y = self.y - point.y;

    match (compare_coordinate(x, 0.0), compare_coordinate(y, 0.0)) {
      (Ordering::Equal, Ordering::Equal) => 0.0,
      (_, _) => normalize_radian(y.atan2(x)),
    }
  }

  pub fn multiply(&self, scalar: f64) -> Self {
    Self::default().with_xy(self.x * scalar, self.y * scalar)
  }

  pub fn reflect(&self, p1: &Self, p2: &Self) -> Self {
    let dx = p2.x - p1.x;
    let dy = p2.y - p1.y;
    let a = (dx * dx - dy * dy) / (dx * dx + dy * dy);
    let b = 2.0 * dx * dy / (dx * dx + dy * dy);

    let x = a * (self.x - p1.x) + b * (self.y - p1.y) + p1.x;
    let y = b * (self.x - p1.x) - a * (self.y - p1.y) + p1.y;

    Self::default().with_xy(x, y)
  }

  pub fn rotate(&self, radians: f64, origin: Option<&Self>) -> Self {
    let default_origin = Self::default();
    let origin = origin.unwrap_or(&default_origin);

    let cos = radians.cos();
    let sin = radians.sin();

    let x = cos * (self.x - origin.x) - sin * (self.y - origin.y) + origin.x;
    let y = sin * (self.x - origin.x) + cos * (self.y - origin.y) + origin.y;

    Self::default().with_xy(x, y)
  }

  pub fn translate(&self, shift: &Self) -> Self {
    Self::default().with_xy(self.x + shift.x, self.y + shift.y)
  }

  pub fn scale(&self, scale: f64) -> Self {
    Self::default().with_xy(self.x * scale, self.y * scale)
  }
}

impl Display for Point {
  fn fmt(&self, fmt: &mut fmt::Formatter) -> Result<(), fmt::Error> {
    write!(fmt, "({}, {})", self.x, self.y)
  }
}

impl Hash for Point {
  fn hash<H: Hasher>(&self, state: &mut H) {
    round_coordinate(self.x).to_string().hash(state);
    round_coordinate(self.y).to_string().hash(state);
  }
}

impl Ord for Point {
  fn cmp(&self, other: &Self) -> Ordering {
    let theta_comparison = compare_radians(self.theta(), other.theta());

    if theta_comparison != Ordering::Equal {
      return theta_comparison;
    }

    compare_coordinate(self.distance_to_center(), other.distance_to_center())
  }
}

impl PartialOrd for Point {
  fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
    Some(self.cmp(other))
  }
}

impl Eq for Point {}

impl PartialEq for Point {
  fn eq(&self, other: &Self) -> bool {
    coordinate_equals(self.x, other.x) && coordinate_equals(self.y, other.y)
  }
}

impl From<Vec<Point>> for Point {
  fn from(points: Vec<Point>) -> Self {
    let length = points.len() as f64;
    let mut x = 0.0;
    let mut y = 0.0;

    for point in points {
      x += point.x;
      y += point.y;
    }

    Point::default().with_xy(x / length, y / length)
  }
}
