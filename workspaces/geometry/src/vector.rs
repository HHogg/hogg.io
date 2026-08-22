#[path = "./vector_tests.rs"]
#[cfg(test)]
mod tests;

use hogg_spatial_grid_map::utils::Fxx;

use super::Point;

#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct Vector2 {
  pub x: Fxx,
  pub y: Fxx,
}

impl Vector2 {
  pub const fn new(x: Fxx, y: Fxx) -> Self {
    Self { x, y }
  }

  pub fn cross(self, other: Self) -> Fxx {
    self.x * other.y - self.y * other.x
  }

  pub fn length(self) -> Fxx {
    self.x.hypot(self.y)
  }
}

impl From<Point> for Vector2 {
  fn from(point: Point) -> Self {
    Self::new(point.x, point.y)
  }
}

impl From<&Point> for Vector2 {
  fn from(point: &Point) -> Self {
    Self::from(*point)
  }
}

impl From<Vector2> for Point {
  fn from(vector: Vector2) -> Self {
    Point::at(vector.x, vector.y)
  }
}

impl std::ops::Add for Vector2 {
  type Output = Self;

  fn add(self, other: Self) -> Self::Output {
    Self::new(self.x + other.x, self.y + other.y)
  }
}

impl std::ops::Sub for Vector2 {
  type Output = Self;

  fn sub(self, other: Self) -> Self::Output {
    Self::new(self.x - other.x, self.y - other.y)
  }
}

impl std::ops::Mul<Fxx> for Vector2 {
  type Output = Self;

  fn mul(self, scalar: Fxx) -> Self::Output {
    Self::new(self.x * scalar, self.y * scalar)
  }
}
