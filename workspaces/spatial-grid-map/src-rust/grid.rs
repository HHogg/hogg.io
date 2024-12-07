#[path = "./grid_tests.rs"]
#[cfg(test)]
mod grid_tests;

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use core::f64;
use std::collections::{BTreeSet, HashMap};
use std::mem;

use crate::bucket::{Bucket, BucketEntry, MutBucketEntry};
use crate::location::{self, Location};
use crate::visitor::Visitor;

#[derive(Debug, Clone, Copy, Deserialize, Serialize)]
#[typeshare]
pub enum ResizeMethod {
  First,
  Fixed,
  Maximum,
  Minimum,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[typeshare]
pub struct SpatialGridMap<TEntryValue: Clone + std::fmt::Debug + Default> {
  /// Default of "2" as 2 * 2 * 64 = 256 bits or a 16x16 grid.
  /// The reason we start with 4 blocks as opposed to 1 block
  /// is to avoid the case of shifting a single block over the center
  /// of 4 blocks which would require some block splitting.
  pub blocks_dimension: u32,
  /// Sorted set of all occupied locations in the grid.
  #[typeshare(serialized_as = "Vec<Location>")]
  pub locations: BTreeSet<Location>,
  /// Resizing
  pub resize_method: ResizeMethod,
  /// Bucket store.
  #[typeshare(serialized_as = "Map<Vec<i32>, Bucket<TEntryValue>>")]
  pub store: HashMap<location::Key, Bucket<TEntryValue>>,
  /// The amount of space each bit represents in the grid.
  spacing: Option<f32>,
}

impl<TEntryValue: Clone + std::fmt::Debug + Default> SpatialGridMap<TEntryValue> {
  pub fn with_resize_method(mut self, resize_method: ResizeMethod) -> Self {
    self.resize_method = resize_method;
    self
  }

  pub fn with_spacing(mut self, spacing: f64) -> Self {
    self.spacing = Some(spacing as f32);
    self
  }

  pub fn get_spacing(&self) -> f64 {
    self.spacing.unwrap_or(1.0) as f64
  }

  pub fn get_grid_size(&self) -> u64 {
    Location::get_grid_size(self.blocks_dimension)
  }

  /// Increases the grid size by making it 4 times larger (a square)
  fn increase_size(&mut self) {
    self.blocks_dimension *= 2;
  }

  fn get_location(&self, point: &(f64, f64)) -> Option<Location> {
    let location = self.get_location_unchecked(point);

    if location.contained {
      Some(location)
    } else {
      None
    }
  }

  fn get_location_unchecked(&self, point: &(f64, f64)) -> Location {
    Location::new(self.blocks_dimension, self.get_spacing(), *point)
  }

  fn get_bucket_by_location(&self, location: &Location) -> Option<&Bucket<TEntryValue>> {
    self.store.get(&location.key)
  }

  fn get_bucket_by_location_mut(
    &mut self,
    location: &Location,
  ) -> Option<&mut Bucket<TEntryValue>> {
    self.store.get_mut(&location.key)
  }

  fn get_bucket_by_point(&self, point: &(f64, f64)) -> Option<&Bucket<TEntryValue>> {
    self
      .get_location(point)
      .and_then(|location| self.get_bucket_by_location(&location))
  }

  fn get_bucket_by_point_mut(&mut self, point: &(f64, f64)) -> Option<&mut Bucket<TEntryValue>> {
    self
      .get_location(point)
      .and_then(|location| self.store.get_mut(&location.key))
  }

  pub fn get_value(&self, point: &(f64, f64)) -> Option<&TEntryValue> {
    self
      .get_bucket_by_point(point)
      .and_then(|bucket| bucket.get_value(point))
  }

  pub fn get_value_mut(&mut self, point: &(f64, f64)) -> Option<MutBucketEntry<TEntryValue>> {
    self
      .get_bucket_by_point_mut(point)
      .and_then(|bucket| bucket.get_entry_mut(point))
  }

  fn get_value_by_location(&self, location: &Location) -> Option<&TEntryValue> {
    self
      .get_bucket_by_location(location)
      .and_then(|bucket| bucket.get_value(&location.point))
  }

  pub fn iter_points(&self) -> impl Iterator<Item = &(f64, f64)> {
    self.locations.iter().map(|location| &location.point)
  }

  pub fn iter_values(&self) -> impl Iterator<Item = &TEntryValue> {
    self
      .locations
      .iter()
      .map(|location| self.get_value_by_location(location).unwrap())
  }

  pub fn iter_values_around(
    &self,
    point: &(f64, f64),
    radius: u8,
  ) -> impl Iterator<Item = &TEntryValue> {
    let location = self.get_location_unchecked(point);

    Visitor::new(location.key, radius)
      .filter_map(move |key| self.store.get(&key))
      .flat_map(|bucket| bucket.iter_values())
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

  fn insert_entry(&mut self, entry: BucketEntry<TEntryValue>) -> MutBucketEntry<TEntryValue> {
    match self.get_location(&entry.point) {
      None => {
        self.increase_size();
        self.insert_entry(entry)
      }
      Some(location) => {
        let point = entry.point;
        let size = entry.size;

        if self.store.entry(location.key).or_default().insert(entry) {
          self.locations.insert(location);
          self.update_spacing(size);
        }

        self
          .get_value_mut(&point)
          .expect("Value not found after insert")
      }
    }
  }

  /// Inserts a point into the grid, returning false if it's already present.
  /// If the grid is too small, it will be increased to fit the new centroid.
  pub fn insert(
    &mut self,
    point: (f64, f64),
    size: f64,
    value: TEntryValue,
  ) -> MutBucketEntry<TEntryValue> {
    self.insert_entry(
      BucketEntry::default()
        .with_point(point)
        .with_value(value)
        .with_size(size as f32),
    )
  }

  pub fn get_counter(&self, point: &(f64, f64), counter: &str) -> Option<&u32> {
    self
      .get_bucket_by_point(point)
      .and_then(|bucket| bucket.get_counter(point, counter))
  }

  pub fn increment_counter(&mut self, point: &(f64, f64), counter: &str) {
    if let Some(bucket) = self.get_bucket_by_point_mut(point) {
      bucket.increment_counter(point, counter)
    }
  }

  pub fn remove(&mut self, point: &(f64, f64)) {
    if let Some(location) = self.get_location(point) {
      self
        .get_bucket_by_location_mut(&location)
        .map(|bucket| bucket.remove(point));

      self.locations.remove(&location);
    }

    self
      .get_bucket_by_point_mut(point)
      .map(|bucket| bucket.remove(point));

    self.locations.remove(&self.get_location(point).unwrap());
  }

  pub fn filter(&self, predicate: impl Fn(&TEntryValue) -> bool) -> Self {
    let mut locations = BTreeSet::new();
    let mut store: HashMap<location::Key, Bucket<TEntryValue>> = HashMap::new();

    for (key, bucket) in &self.store {
      for entry in bucket.iter() {
        if predicate(&entry.value) {
          store.entry(*key).or_default().insert(
            BucketEntry::default()
              .with_point(entry.point)
              .with_value(entry.value.clone())
              .with_counters(entry.counters.clone()),
          );

          locations.insert(self.get_location(&entry.point).unwrap());
        }
      }
    }

    SpatialGridMap {
      blocks_dimension: self.blocks_dimension,
      locations,
      resize_method: self.resize_method,
      spacing: self.spacing,
      store,
    }
  }

  fn update_spacing(&mut self, new_spacing: f32) {
    match self.resize_method {
      ResizeMethod::First => {
        if self.spacing.is_none() {
          self.spacing = Some(new_spacing);
        } else {
          return;
        }
      }
      ResizeMethod::Fixed => {
        return;
      }
      ResizeMethod::Maximum => {
        if new_spacing > self.get_spacing() as f32 {
          self.spacing = Some(new_spacing);
        } else {
          return;
        }
      }
      ResizeMethod::Minimum => {
        if new_spacing < self.get_spacing() as f32 {
          self.spacing = Some(new_spacing);
        } else {
          return;
        }
      }
    }

    let old_locations = mem::take(&mut self.locations);
    let mut old_store = mem::take(&mut self.store);

    self.blocks_dimension = 2;

    for location in old_locations {
      let bucket = old_store
        .get_mut(&location.key)
        .expect("Bucket not found while updating spacing");
      let bucket_entry = bucket
        .take_entry(&location.point)
        .expect("Bucket entry not found while updating spacing");

      self.insert_entry(
        BucketEntry::default()
          .with_point(location.point)
          .with_value(bucket_entry.value)
          .with_counters(bucket_entry.counters),
      );
    }
  }
}

impl<TEntryValue: Clone + std::fmt::Debug + Default> Default for SpatialGridMap<TEntryValue> {
  fn default() -> Self {
    SpatialGridMap {
      blocks_dimension: 2,
      locations: BTreeSet::new(),
      resize_method: ResizeMethod::Fixed,
      spacing: None,
      store: HashMap::new(),
    }
  }
}
