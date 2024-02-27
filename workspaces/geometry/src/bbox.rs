#[path = "./bbox_tests.rs"]
#[cfg(test)]
mod tests;

use std::fmt::Display;

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use super::Point;

#[derive(Clone, Copy, Debug, Deserialize, PartialEq, Eq, Serialize)]
#[typeshare]
pub struct BBox {
  pub min: Point,
  pub max: Point,
}

impl BBox {
  pub fn with_min(mut self, min: Point) -> Self {
    self.min = min;
    self
  }

  pub fn with_max(mut self, max: Point) -> Self {
    self.max = max;
    self
  }

  pub fn with_width(mut self, width: f64) -> Self {
    self.max.x = self.min.x + width;
    self
  }

  pub fn with_height(mut self, height: f64) -> Self {
    self.max.y = self.min.y + height;
    self
  }

  pub fn get_abs_min_point(&self) -> Point {
    let x = self.min.x.abs().min(self.max.x);
    let y = self.min.y.abs().min(self.max.y);

    Point::default().with_xy(x, y)
  }

  pub fn get_abs_max_point(&self) -> Point {
    let x = self.min.x.abs().max(self.max.x);
    let y = self.min.y.abs().max(self.max.y);

    Point::default().with_xy(x, y)
  }

  pub fn width(&self) -> f64 {
    self.max.x - self.min.x
  }

  pub fn height(&self) -> f64 {
    self.max.y - self.min.y
  }

  pub fn ratio(&self) -> f64 {
    self.width() / self.height()
  }

  pub fn radius(&self) -> f64 {
    self.width().max(self.height()) * 0.5
  }

  pub fn centroid(&self) -> Point {
    Point::default().with_xy(
      (self.min.x + self.max.x) * 0.5,
      (self.min.y + self.max.y) * 0.5,
    )
  }

  pub fn contains(&self, point: &Point) -> bool {
    point.x >= self.min.x && point.x <= self.max.x && point.y >= self.min.y && point.y <= self.max.y
  }

  pub fn contains_bbox(&self, other: &Self) -> bool {
    self.contains(&other.min) && self.contains(&other.max)
  }

  pub fn add(&self, point: &Point) -> Self {
    let min = Point::default().with_xy(self.min.x.min(point.x), self.min.y.min(point.y));
    let max = Point::default().with_xy(self.max.x.max(point.x), self.max.y.max(point.y));

    Self { min, max }
  }

  pub fn union(&self, other: &Self) -> Self {
    let min = Point::default().with_xy(self.min.x.min(other.min.x), self.min.y.min(other.min.y));
    let max = Point::default().with_xy(self.max.x.max(other.max.x), self.max.y.max(other.max.y));

    Self { min, max }
  }

  pub fn div(&self, scale: f64) -> Self {
    let min = Point::default().with_xy(self.min.x / scale, self.min.y / scale);
    let max = Point::default().with_xy(self.max.x / scale, self.max.y / scale);

    Self { min, max }
  }

  pub fn pad(&self, padding: f64) -> Self {
    let x_padding = self.width() * padding;
    let y_padding = self.height() * padding;

    let min = Point::default().with_xy(self.min.x - x_padding, self.min.y - y_padding);
    let max = Point::default().with_xy(self.max.x + x_padding, self.max.y + y_padding);

    Self { min, max }
  }

  pub fn mul(&self, scale: f64) -> Self {
    let min = Point::default().with_xy(self.min.x * scale, self.min.y * scale);
    let max = Point::default().with_xy(self.max.x * scale, self.max.y * scale);

    Self { min, max }
  }

  // Rotate the bounding box CW by 90 degrees
  pub fn rotate(&self) -> Self {
    let min = Point::default().with_xy(self.min.y, -self.max.x);
    let max = Point::default().with_xy(self.max.y, -self.min.x);

    Self { min, max }
  }

  pub fn translate(&self, x_multiplier: f64, y_multiplier: f64) -> Self {
    let offset =
      Point::default().with_xy(self.width() * x_multiplier, self.height() * y_multiplier);

    let min = self.min.clone().translate(&offset);
    let max = self.max.clone().translate(&offset);

    Self { min, max }
  }

  pub fn to_square(&self) -> Self {
    let d = self.width() - self.height();

    if d > 0.0 {
      let min = Point::default().with_xy(self.min.x, self.min.y - (d * 0.5));
      let max = Point::default().with_xy(self.max.x, self.max.y + (d * 0.5));

      Self { min, max }
    } else if d < 0.0 {
      let min = Point::default().with_xy(self.min.x - (d * -0.5), self.min.y);
      let max = Point::default().with_xy(self.max.x + (d * -0.5), self.max.y);

      Self { min, max }
    } else {
      *self
    }
  }

  pub fn intersects_bbox(&self, other: &Self) -> bool {
    if self.min.x > other.max.x || other.min.x > self.max.x {
      return false;
    }

    if self.min.y > other.max.y || other.min.y > self.max.y {
      return false;
    }

    true
  }
}

impl Default for BBox {
  fn default() -> Self {
    Self {
      min: Point::default().with_xy(0.0, 0.0),
      max: Point::default().with_xy(0.0, 0.0),
    }
  }
}

impl Display for BBox {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(
      f,
      "[Min={}, Max={}, Width={}, Height={}]",
      self.min,
      self.max,
      self.width(),
      self.height()
    )
  }
}

impl From<(Point, Point)> for BBox {
  fn from((min, max): (Point, Point)) -> Self {
    Self { min, max }
  }
}

impl From<Vec<Point>> for BBox {
  fn from(points: Vec<Point>) -> Self {
    let mut min_x = f64::INFINITY;
    let mut min_y = f64::INFINITY;
    let mut max_x = -f64::INFINITY;
    let mut max_y = -f64::INFINITY;

    for point in points {
      if point.x < min_x {
        min_x = point.x;
      }

      if point.y < min_y {
        min_y = point.y;
      }

      if point.x > max_x {
        max_x = point.x;
      }

      if point.y > max_y {
        max_y = point.y;
      }
    }

    let min = Point::default().with_xy(min_x, min_y);
    let max = Point::default().with_xy(max_x, max_y);

    Self { min, max }
  }
}
