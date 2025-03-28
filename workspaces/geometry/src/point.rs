#[path = "./point_tests.rs"]
#[cfg(test)]
mod point_tests;

use std::fmt::{self, Display};

use hogg_spatial_grid_map::location;
use hogg_spatial_grid_map::utils::{coordinate_equals, get_radians_for_x_y, Fxx};
use ordered_float::OrderedFloat;
use serde::{Deserialize, Serialize};
use typeshare::typeshare;

#[derive(Clone, Copy, Debug, Default, Deserialize, Serialize)]
#[typeshare]
pub struct Point {
  pub x: Fxx,
  pub y: Fxx,
  pub index: u8,
}

impl Point {
  pub fn at(x: Fxx, y: Fxx) -> Self {
    Self::default().with_x(x).with_y(y)
  }

  pub fn with_x(mut self, x: Fxx) -> Self {
    self.x = x;
    self
  }

  pub fn with_y(mut self, y: Fxx) -> Self {
    self.y = y;
    self
  }

  pub fn with_index(mut self, index: u8) -> Self {
    self.index = index;
    self
  }

  pub fn theta(&self) -> Fxx {
    self.radian_to(&Self::at(0.0, 0.0))
  }

  pub fn distance_to(&self, point: &Self) -> Fxx {
    (point.x - self.x).hypot(point.y - self.y)
  }

  pub fn distance_to_center(&self) -> Fxx {
    self.distance_to(&Self::at(0.0, 0.0))
  }

  pub fn radian_to(&self, point: &Self) -> Fxx {
    get_radians_for_x_y(self.x - point.x, self.y - point.y)
  }

  pub fn radian_to_center(&self) -> Fxx {
    self.radian_to(&Self::at(0.0, 0.0))
  }

  pub fn multiply(&self, scalar: Fxx) -> Self {
    Self::at(self.x * scalar, self.y * scalar).with_index(self.index)
  }

  pub fn reflect(&self, p1: &Self, p2: &Self) -> Self {
    let dx = p2.x - p1.x;
    let dy = p2.y - p1.y;
    let a = (dx * dx - dy * dy) / (dx * dx + dy * dy);
    let b = 2.0 * dx * dy / (dx * dx + dy * dy);

    let x = a * (self.x - p1.x) + b * (self.y - p1.y) + p1.x;
    let y = b * (self.x - p1.x) - a * (self.y - p1.y) + p1.y;

    Self::at(x, y).with_index(self.index)
  }

  pub fn rotate(&self, radians: Fxx, origin: Option<&Self>) -> Self {
    let default_origin = Self::default();
    let origin = origin.unwrap_or(&default_origin);

    let cos = radians.cos();
    let sin = radians.sin();

    let x = cos * (self.x - origin.x) - sin * (self.y - origin.y) + origin.x;
    let y = sin * (self.x - origin.x) + cos * (self.y - origin.y) + origin.y;

    Self::at(x, y).with_index(self.index)
  }

  pub fn translate(&self, shift: &Self) -> Self {
    Self::at(self.x + shift.x, self.y + shift.y).with_index(self.index)
  }

  pub fn scale(&self, scale: Fxx) -> Self {
    Self::at(self.x * scale, self.y * scale).with_index(self.index)
  }
}

impl Display for Point {
  fn fmt(&self, fmt: &mut fmt::Formatter) -> Result<(), fmt::Error> {
    write!(fmt, "({}, {})", self.x, self.y)
  }
}

impl Eq for Point {}

impl PartialEq for Point {
  fn eq(&self, other: &Self) -> bool {
    coordinate_equals(self.x, other.x) && coordinate_equals(self.y, other.y)
  }
}

impl From<Point> for location::Point {
  fn from(value: Point) -> Self {
    location::Point(value.x, value.y)
  }
}

impl From<&Point> for location::Point {
  fn from(value: &Point) -> Self {
    location::Point(value.x, value.y)
  }
}

impl From<location::Point> for Point {
  fn from(value: location::Point) -> Self {
    Point::at(value.0, value.1)
  }
}

impl From<&location::Point> for Point {
  fn from(value: &location::Point) -> Self {
    Point::at(value.0, value.1)
  }
}

impl From<&Vec<Point>> for Point {
  fn from(points: &Vec<Point>) -> Self {
    let length = points.len() as Fxx;
    let mut x = 0.0;
    let mut y = 0.0;

    for point in points {
      x += point.x;
      y += point.y;
    }

    Point::at(x / length, y / length)
  }
}

pub fn sort_points_around_origin(points: &mut [Point], origin: &Point) {
  points.sort_by(|a, b| {
    let a_radians = OrderedFloat(a.radian_to(origin));
    let b_radians = OrderedFloat(b.radian_to(origin));

    let radian_comparison = a_radians.cmp(&b_radians);

    if radian_comparison == std::cmp::Ordering::Equal {
      let a_distance = OrderedFloat(a.distance_to(origin));
      let b_distance = OrderedFloat(b.distance_to(origin));

      a_distance.cmp(&b_distance)
    } else {
      radian_comparison
    }
  });
}
