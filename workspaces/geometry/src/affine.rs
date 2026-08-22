#[path = "./affine_tests.rs"]
#[cfg(test)]
mod tests;

use hogg_spatial_grid_map::utils::Fxx;

use super::{LineSegment, Point, Vector2};

/// A two-dimensional affine transform.
///
/// Points are transformed as `linear * point + translation`. The linear
/// coefficients are stored in row-major order: `[xx, xy, yx, yy]`.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Affine2 {
  linear: [Fxx; 4],
  translation: Vector2,
}

impl Affine2 {
  pub const fn identity() -> Self {
    Self::from_parts([1.0, 0.0, 0.0, 1.0], Vector2::new(0.0, 0.0))
  }

  pub const fn from_parts(linear: [Fxx; 4], translation: Vector2) -> Self {
    Self {
      linear,
      translation,
    }
  }

  pub fn from_translation(translation: Vector2) -> Self {
    Self::from_parts([1.0, 0.0, 0.0, 1.0], translation)
  }

  /// Builds a rotation around `origin`, or around `(0, 0)` when it is `None`.
  pub fn rotation(radians: Fxx, origin: Option<&Point>) -> Self {
    let origin = origin.copied().unwrap_or_default();
    let cos = radians.cos();
    let sin = radians.sin();
    let linear = [cos, -sin, sin, cos];
    let transformed_origin = apply_linear(linear, Vector2::from(origin));

    Self::from_parts(
      linear,
      Vector2::new(
        origin.x - transformed_origin.x,
        origin.y - transformed_origin.y,
      ),
    )
  }

  /// Builds a reflection in the infinite line containing `line_segment`.
  ///
  /// A zero-length or non-finite line does not define a reflection.
  pub fn reflection(line_segment: &LineSegment) -> Option<Self> {
    Self::reflection_between(&line_segment.start, &line_segment.end)
  }

  /// Builds a reflection in the infinite line through `start` and `end`.
  ///
  /// A zero-length or non-finite line does not define a reflection.
  pub fn reflection_between(start: &Point, end: &Point) -> Option<Self> {
    let dx = end.x - start.x;
    let dy = end.y - start.y;
    let length_squared = dx * dx + dy * dy;

    if length_squared == 0.0 || !length_squared.is_finite() {
      return None;
    }

    let linear = [
      (dx * dx - dy * dy) / length_squared,
      2.0 * dx * dy / length_squared,
      2.0 * dx * dy / length_squared,
      (dy * dy - dx * dx) / length_squared,
    ];
    let transformed_start = apply_linear(linear, Vector2::from(start));

    Some(Self::from_parts(
      linear,
      Vector2::new(start.x - transformed_start.x, start.y - transformed_start.y),
    ))
  }

  /// Applies this transform to a point, preserving the point's index.
  pub fn apply(&self, point: &Point) -> Point {
    let transformed = self.apply_coordinates(Vector2::from(point));

    Point::at(transformed.x, transformed.y).with_index(point.index)
  }

  /// Applies only the linear part of this transform to a vector.
  pub fn apply_vector(&self, vector: Vector2) -> Vector2 {
    apply_linear(self.linear, vector)
  }

  /// Composes two transforms as `self ∘ other`.
  ///
  /// The returned transform applies `other` first, followed by `self`.
  pub fn compose(&self, other: &Self) -> Self {
    let [xx, xy, yx, yy] = self.linear;
    let [other_xx, other_xy, other_yx, other_yy] = other.linear;
    let linear = [
      xx * other_xx + xy * other_yx,
      xx * other_xy + xy * other_yy,
      yx * other_xx + yy * other_yx,
      yx * other_xy + yy * other_yy,
    ];
    let other_translation = self.apply_vector(other.translation);

    Self::from_parts(linear, other_translation + self.translation)
  }

  pub fn inverse(&self) -> Option<Self> {
    let determinant = self.determinant();

    if determinant == 0.0 || !determinant.is_finite() {
      return None;
    }

    let [xx, xy, yx, yy] = self.linear;
    let linear = [
      yy / determinant,
      -xy / determinant,
      -yx / determinant,
      xx / determinant,
    ];
    let inverse_translation = apply_linear(linear, self.translation);
    let inverse = Self::from_parts(linear, inverse_translation * -1.0);

    inverse.is_finite().then_some(inverse)
  }

  pub fn determinant(&self) -> Fxx {
    let [xx, xy, yx, yy] = self.linear;

    xx * yy - xy * yx
  }

  pub fn reverses_orientation(&self) -> bool {
    self.determinant() < 0.0
  }

  pub const fn linear(&self) -> [Fxx; 4] {
    self.linear
  }

  pub const fn translation(&self) -> Vector2 {
    self.translation
  }

  fn apply_coordinates(&self, coordinates: Vector2) -> Vector2 {
    let transformed = apply_linear(self.linear, coordinates);

    transformed + self.translation
  }

  fn is_finite(&self) -> bool {
    self.linear.iter().all(|value| value.is_finite())
      && self.translation.x.is_finite()
      && self.translation.y.is_finite()
  }
}

impl Default for Affine2 {
  fn default() -> Self {
    Self::identity()
  }
}

fn apply_linear(linear: [Fxx; 4], coordinates: Vector2) -> Vector2 {
  let [xx, xy, yx, yy] = linear;
  let Vector2 { x, y } = coordinates;

  Vector2::new(xx * x + xy * y, yx * x + yy * y)
}
