#[path = "./grid_tests.rs"]
#[cfg(test)]
mod grid_tests;

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use core::f64;
use std::collections::HashMap;

use crate::bucket::Bucket;
use crate::location::{self, Location};

const BLOCK_SIZE: u64 = 8; // Sqrt(64)
pub(super) const TOLERANCE: f64 = 0.0001525;

#[derive(Debug, Clone, Deserialize, Serialize)]
#[typeshare]
pub struct SpatialGridMap<TEntryValue: Clone + std::fmt::Debug + Default> {
  /// Default of "2" as 2 * 2 * 64 = 256 bits or a 16x16 grid.
  /// The reason we start with 4 blocks as opposed to 1 block
  /// is to avoid the case of shifting a single block over the center
  /// of 4 blocks which would require some block splitting.
  pub blocks_dimension: u32,
  /// Debug flag. If true, the grid will print debug information.
  pub debug: bool,
  /// Lookup entry.
  #[typeshare(serialized_as = "Map<Vec<i32>, Bucket<TEntryValue>>")]
  pub store: HashMap<location::Key, Bucket<TEntryValue>>,
  /// The amount of space each bit represents in the grid.
  pub spacing: f32,
}

impl<TEntryValue: Clone + std::fmt::Debug + Default> SpatialGridMap<TEntryValue> {
  pub fn with_spacing(self, spacing: f32) -> Self {
    SpatialGridMap { spacing, ..self }
  }

  pub fn with_debugging(self) -> Self {
    SpatialGridMap {
      debug: true,
      ..self
    }
  }

  pub fn get_grid_size(&self) -> u64 {
    (self.blocks_dimension as u64) * BLOCK_SIZE
  }

  /// Increases the grid size by making it 4 times larger (a square)
  fn increase_size(&mut self) {
    self.blocks_dimension *= 2;
  }

  fn get_location(&self, point: &(f64, f64)) -> Option<Location> {
    let (x, y) = point;
    let grid_size = self.get_grid_size();
    let grid_size_div2 = grid_size / 2;

    // Scale the coordinates according to the bit size
    let mut scaled_x = x / self.spacing as f64;
    let mut scaled_y = y / self.spacing as f64;

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
    let adjusted_x = scaled_x + grid_size_div2 as f64;
    let adjusted_y = scaled_y + grid_size_div2 as f64;

    // Ensure the coordinates are within the grid
    if adjusted_x < 0.0
      || adjusted_y < 0.0
      || adjusted_x >= grid_size as f64
      || adjusted_y >= grid_size as f64
    {
      return None;
    }

    let adjusted_x = adjusted_x as u64;
    let adjusted_y = adjusted_y as u64;

    // Determine the number of blocks along one dimension
    let num_blocks_per_row = grid_size / BLOCK_SIZE;

    // Find the x and y block indices
    let block_x = adjusted_x / BLOCK_SIZE;
    let block_y = adjusted_y / BLOCK_SIZE;

    // Calculate the block index
    let mut block_index = block_y * num_blocks_per_row + block_x;

    // Find the local coordinates within the block (0-63)
    let bit_x = adjusted_x % BLOCK_SIZE;
    let bit_y = adjusted_y % BLOCK_SIZE;

    // Calculate the bit index within the block
    let mut bit_index = bit_y * BLOCK_SIZE + bit_x;

    // Calculate the x and y offset from the center
    let absolute_bit_x = block_x * BLOCK_SIZE + bit_x;
    let absolute_bit_y = block_y * BLOCK_SIZE + bit_y;
    let bit_dx = absolute_bit_x as i64 - grid_size_div2 as i64;
    let bit_dy = absolute_bit_y as i64 - grid_size_div2 as i64;

    let key = (bit_dx, bit_dy);

    // The block and bit indexes above are calculated as if the blocks
    // were made up of 64 bits. We need to adjust the block index and
    // bit index to account for the fact they are stored as 32 bits.
    block_index *= 2;

    if bit_index >= 32 {
      block_index += 1;
      bit_index -= 32;
    }

    Some(Location {
      key,
      block_index,
      bit_index,
    })
  }

  fn get_bucket(&self, point: &(f64, f64)) -> Option<&Bucket<TEntryValue>> {
    self
      .get_location(point)
      .and_then(|location| self.store.get(&location.key))
  }

  fn get_bucket_mut(&mut self, point: &(f64, f64)) -> Option<&mut Bucket<TEntryValue>> {
    self
      .get_location(point)
      .and_then(|location| self.store.get_mut(&location.key))
  }

  pub fn get_value(&self, point: &(f64, f64)) -> Option<&TEntryValue> {
    self
      .get_bucket(point)
      .and_then(|bucket| bucket.get_value(point))
  }

  pub fn get_value_mut(&mut self, point: &(f64, f64)) -> Option<&mut TEntryValue> {
    self
      .get_bucket_mut(point)
      .and_then(|bucket| bucket.get_value_mut(point))
  }

  pub fn iter_values(&self) -> impl Iterator<Item = &TEntryValue> {
    self.store.values().flat_map(|bucket| bucket.iter_values())
  }

  pub fn iter_values_around(
    &self,
    point: &(f64, f64),
    radius: u8,
  ) -> Option<impl Iterator<Item = &TEntryValue>> {
    self.get_location(point).map(|location| {
      location::Visitor::new(location.key, radius)
        .filter_map(move |key| self.store.get(&key))
        .flat_map(|bucket| bucket.iter_values())
    })
  }

  pub fn size(&self) -> usize {
    self.store.values().map(|bucket| bucket.size()).sum()
  }

  pub fn is_empty(&self) -> bool {
    self.iter_values().next().is_none()
  }

  /// Checks if the grid contains the given centroid.
  pub fn contains(&self, point: &(f64, f64)) -> bool {
    self.get_value(point).is_some()
  }
  /// Inserts a point into the grid, returning false if it's already present.
  /// If the grid is too small, it will be increased to fit the new centroid.
  pub fn insert(&mut self, point: (f64, f64), value: TEntryValue) -> &mut Self {
    match self.get_location(&point) {
      None => {
        self.increase_size();
        self.insert(point, value);
      }
      Some(entry) => {
        self
          .store
          .entry(entry.key)
          .or_default()
          .insert(point, value);
      }
    };

    self
  }

  pub fn get_counter(&self, point: &(f64, f64), counter: &str) -> Option<&u32> {
    self
      .get_bucket(point)
      .and_then(|bucket| bucket.get_counter(point, counter))
  }

  pub fn increment_counter(&mut self, point: &(f64, f64), counter: &str) {
    if let Some(bucket) = self.get_bucket_mut(point) {
      bucket.increment_counter(point, counter)
    }
  }

  pub fn remove(&mut self, point: &(f64, f64)) -> Option<TEntryValue> {
    self
      .get_bucket_mut(point)
      .and_then(|bucket| bucket.remove(point))
  }

  pub fn filter(&self, predicate: impl Fn(&TEntryValue) -> bool) -> Self {
    let mut store: HashMap<location::Key, Bucket<TEntryValue>> = HashMap::new();

    for (key, bucket) in &self.store {
      for entry in bucket.iter() {
        if predicate(&entry.value) {
          store
            .entry(*key)
            .or_default()
            .insert(entry.point, entry.value.clone());
        }
      }
    }

    SpatialGridMap {
      blocks_dimension: self.blocks_dimension,
      debug: self.debug,
      spacing: self.spacing,
      store,
    }
  }
}

impl<TEntryValue: Clone + std::fmt::Debug + Default> Default for SpatialGridMap<TEntryValue> {
  fn default() -> Self {
    SpatialGridMap {
      blocks_dimension: 2,
      debug: false,
      spacing: 1.0,
      store: HashMap::new(),
    }
  }
}
