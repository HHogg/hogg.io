#[path = "./location_tests.rs"]
#[cfg(test)]
mod tests;

use std::cmp::Ordering;

use ordered_float::NotNan;
use serde::{Deserialize, Serialize};

use crate::utils::{coordinate_equals, get_radians_for_x_y, radians_equal};

const BLOCK_SIZE: u64 = 8; // Sqrt(64)
pub(super) const TOLERANCE: f32 = 0.0001525;

pub type Key = (i64, i64);

#[derive(Clone, Copy, Debug, Default, Deserialize, Serialize)]
pub struct Point(pub f32, pub f32);

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Location {
  pub key: Key,
  pub point: Point,

  contained: bool,
  distance: NotNan<f32>,
  radians: NotNan<f32>,
}

impl Location {
  pub fn get_grid_size(blocks_dimension: u32) -> u64 {
    (blocks_dimension as u64) * BLOCK_SIZE
  }

  pub fn get_grid_point(blocks_dimension: u32, spacing: f32, point: Point) -> Point {
    let Point(x, y) = point;
    let grid_size = Self::get_grid_size(blocks_dimension);
    let grid_size_div2 = grid_size / 2;

    // Scale the coordinates according to the bit size
    let mut scaled_x = x / spacing;
    let mut scaled_y = y / spacing;

    // We need to snap the coordinates to the grid.
    // To handle precision errors, anything that is less
    // than a whole number by some threshold we will snap
    // up to the whole number.
    let dx = (scaled_x - scaled_x.round()).abs();
    let dy = (scaled_y - scaled_y.round()).abs();

    if dx <= TOLERANCE {
      scaled_x = scaled_x.round();
    } else {
      scaled_x = scaled_x.floor();
    }

    if dy <= TOLERANCE {
      scaled_y = scaled_y.round();
    } else {
      scaled_y = scaled_y.floor();
    }

    // Adjust the coordinates relative to the grid center
    let adjusted_x = scaled_x + grid_size_div2 as f32;
    let adjusted_y = scaled_y + grid_size_div2 as f32;

    Point(adjusted_x, adjusted_y)
  }

  pub fn get_is_contained(blocks_dimension: u32, spacing: f32, point: Point) -> bool {
    let grid_size = Self::get_grid_size(blocks_dimension) as f32;
    let Point(x, y) = Self::get_grid_point(blocks_dimension, spacing, point);

    x >= 0.0 && y >= 0.0 && x < grid_size && y < grid_size
  }

  pub fn get_key(blocks_dimension: u32, spacing: f32, point: Point) -> Key {
    let Point(grid_x, grid_y) = Self::get_grid_point(blocks_dimension, spacing, point);
    let grid_size = Self::get_grid_size(blocks_dimension);
    let grid_size_div2 = (grid_size / 2) as i64;

    let x = grid_x as u64;
    let y = grid_y as u64;

    // Find the x and y block indices
    let block_x = x / BLOCK_SIZE;
    let block_y = y / BLOCK_SIZE;

    // Find the local coordinates within the block (0-63)
    let bit_x = x % BLOCK_SIZE;
    let bit_y = y % BLOCK_SIZE;

    // Calculate the bit index within the block
    // Calculate the x and y offset from the center
    let absolute_bit_x = (block_x * BLOCK_SIZE + bit_x) as i64;
    let absolute_bit_y = (block_y * BLOCK_SIZE + bit_y) as i64;
    let bit_dx = absolute_bit_x - grid_size_div2;
    let bit_dy = absolute_bit_y - grid_size_div2;

    (bit_dx, bit_dy)
  }

  pub fn new(blocks_dimension: u32, spacing: f32, point: Point, rotation: Option<f32>) -> Self {
    let Point(x, y) = point;
    let key = Self::get_key(blocks_dimension, spacing, point);

    // Ensure the coordinates are within the grid
    let contained = Self::get_is_contained(blocks_dimension, spacing, point);

    let distance = (x * x + y * y).sqrt();
    let mut radians = get_radians_for_x_y(x, y);

    //
    if let Some(rotation) = rotation {
      if radians_equal(radians, 0.0) && radians_equal(rotation, 0.0) {
        radians = std::f32::consts::PI * 2.0;
      }
    }

    Location {
      point,
      key,
      contained,

      distance: NotNan::new(distance).expect("Distance not to be NaN"),
      radians: NotNan::new(radians).expect("Radian not to be NaN"),
    }
  }

  pub fn is_contained(&self) -> bool {
    self.contained
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
    let theta_comparison = self.radians.cmp(&other.radians);

    if theta_comparison != Ordering::Equal {
      return theta_comparison;
    }

    self.distance.cmp(&other.distance)
  }
}

impl PartialOrd for Location {
  fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
    Some(self.cmp(other))
  }
}
