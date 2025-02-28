#[path = "./location_tests.rs"]
#[cfg(test)]
mod tests;

use std::cmp::Ordering;

use ordered_float::NotNan;
use serde::{Deserialize, Serialize};

use crate::utils::{
  coordinate_equals, get_radians_for_x_y, radians_equal, PI2, TOLERANCE_COORDINATE,
};
use crate::Fxx;

pub type Key = (i64, i64);

#[derive(Clone, Copy, Debug, Default, Deserialize, Serialize)]
pub struct Point(pub Fxx, pub Fxx);

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Location {
  pub key: Key,
  pub point: Point,

  distance: NotNan<Fxx>,
  radians: NotNan<Fxx>,
}

impl Location {
  pub fn get_key(spacing: Fxx, point: Point) -> Key {
    let Point(x, y) = point;

    let grid_x = Self::get_grid_value(spacing, x);
    let grid_y = Self::get_grid_value(spacing, y);

    (grid_x as i64, grid_y as i64)
  }

  fn get_grid_value(spacing: Fxx, value: Fxx) -> Fxx {
    let mut snapped_value = value / spacing;
    let distance = (snapped_value.ceil() - snapped_value).abs();

    if distance <= TOLERANCE_COORDINATE {
      snapped_value = snapped_value.ceil();
    } else {
      snapped_value = snapped_value.floor();
    }

    snapped_value
  }

  pub fn new(spacing: Fxx, point: Point, rotation: Option<Fxx>) -> Self {
    let Point(x, y) = point;
    let key = Self::get_key(spacing, point);

    // Ensure the coordinates are within the grid
    let distance = (x * x + y * y).sqrt();
    let mut radians = get_radians_for_x_y(x, y);

    //
    if let Some(rotation) = rotation {
      if radians_equal(radians, 0.0) && radians_equal(rotation, 0.0) {
        radians = PI2;
      }
    }

    Location {
      point,
      key,

      distance: NotNan::new(distance).expect("Distance not to be NaN"),
      radians: NotNan::new(radians).expect("Radian not to be NaN"),
    }
  }
}

impl Eq for Location {}

impl PartialEq for Location {
  fn eq(&self, other: &Self) -> bool {
    coordinate_equals(self.point.0, other.point.0) && coordinate_equals(self.point.0, other.point.0)
  }
}

impl Ord for Location {
  fn cmp(&self, other: &Self) -> std::cmp::Ordering {
    if radians_equal(self.radians.into_inner(), other.radians.into_inner()) {
      return other.distance.cmp(&self.distance);
    }

    self.radians.cmp(&other.radians)
  }
}

impl PartialOrd for Location {
  fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
    Some(self.cmp(other))
  }
}
