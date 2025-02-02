#[path = "./grid_tests.rs"]
#[cfg(test)]
mod grid_tests;

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use core::f32;

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
  id: String,
  /// Default of "2" as 2 * 2 * 64 = 256 bits or a 16x16 grid.
  /// The reason we start with 4 blocks as opposed to 1 block
  /// is to avoid the case of shifting a single block over the center
  /// of 4 blocks which would require some block splitting.
  blocks_dimension: u32,
  /// Sorted set of all occupied locations in the grid.
  #[typeshare(serialized_as = "Vec<Location>")]
  locations: BTreeSet<Location>,
  /// Resizing
  resize_method: ResizeMethod,
  /// Bucket store.
  #[typeshare(serialized_as = "Map<Vec<i32>, Bucket<TEntryValue>>")]
  store: HashMap<location::Key, Bucket<TEntryValue>>,
  /// The amount of space each bit represents in the grid.
  spacing: Option<f32>,
}

impl<TEntryValue: Clone + std::fmt::Debug + Default> SpatialGridMap<TEntryValue> {
  pub fn new(id: &str) -> Self {
    SpatialGridMap {
      id: id.to_string(),
      blocks_dimension: 2,
      locations: BTreeSet::new(),
      resize_method: ResizeMethod::First,
      spacing: None,
      store: HashMap::new(),
    }
  }

  pub fn with_resize_method(mut self, resize_method: ResizeMethod) -> Self {
    self.resize_method = resize_method;
    self
  }

  pub fn with_spacing(mut self, spacing: f32) -> Self {
    self.spacing = Some(spacing);
    self
  }

  pub fn get_spacing(&self) -> f32 {
    self.spacing.unwrap_or(1.0)
  }

  pub fn get_grid_size(&self) -> u64 {
    Location::get_grid_size(self.blocks_dimension)
  }

  /// Increases the grid size by making it 4 times larger (a square)
  fn increase_size(&mut self) {
    self.blocks_dimension *= 2;
  }

  fn get_location(&self, point: &location::Point, rotation: &Option<f32>) -> Option<Location> {
    let location = self.get_location_unchecked(point, rotation);

    if location.is_contained() {
      Some(location)
    } else {
      None
    }
  }

  fn get_location_unchecked(&self, point: &location::Point, rotation: &Option<f32>) -> Location {
    Location::new(self.blocks_dimension, self.get_spacing(), *point, *rotation)
  }

  fn get_bucket_by_location_key(&self, key: &location::Key) -> Option<&Bucket<TEntryValue>> {
    self.store.get(key)
  }

  fn get_bucket_by_location_key_mut(
    &mut self,
    key: &location::Key,
  ) -> Option<&mut Bucket<TEntryValue>> {
    self.store.get_mut(key)
  }

  fn create_location_key(&self, point: &location::Point) -> Option<location::Key> {
    let location_key = self.create_location_key_unchecked(point);
    let is_contained =
      Location::get_is_contained(self.blocks_dimension, self.get_spacing(), *point);

    if is_contained {
      Some(location_key)
    } else {
      None
    }
  }

  fn create_location_key_unchecked(&self, point: &location::Point) -> location::Key {
    Location::get_key(self.blocks_dimension, self.get_spacing(), *point)
  }

  fn get_location_by_key(&self, key: &location::Key) -> Option<Location> {
    self
      .locations
      .iter()
      .find(|location| location.key == *key)
      .cloned()
  }

  fn get_bucket_by_point(&self, point: &location::Point) -> Option<&Bucket<TEntryValue>> {
    self
      .create_location_key(point)
      .and_then(|key| self.get_bucket_by_location_key(&key))
  }

  fn get_bucket_by_point_mut(
    &mut self,
    point: &location::Point,
  ) -> Option<&mut Bucket<TEntryValue>> {
    self
      .create_location_key(point)
      .and_then(|location| self.get_bucket_by_location_key_mut(&location))
  }

  pub fn get_value(&self, point: &location::Point) -> Option<&TEntryValue> {
    self
      .get_bucket_by_point(point)
      .and_then(|bucket| bucket.get_value(point))
  }

  pub fn get_value_mut(&mut self, point: &location::Point) -> Option<MutBucketEntry<TEntryValue>> {
    self
      .get_bucket_by_point_mut(point)
      .and_then(|bucket| bucket.get_entry_mut(point))
  }

  fn get_value_by_location(&self, location: &Location) -> Option<&TEntryValue> {
    self
      .get_bucket_by_location_key(&location.key)
      .and_then(|bucket| bucket.get_value(&location.point))
  }

  pub fn iter_points(&self) -> impl Iterator<Item = &location::Point> {
    self.locations.iter().map(|location| &location.point)
  }

  pub fn iter_values(&self) -> impl Iterator<Item = &TEntryValue> {
    self.locations.iter().map(|location| {
      self
        .get_value_by_location(location)
        .expect("Value not found for location")
    })
  }

  pub fn iter_values_around(
    &self,
    point: &location::Point,
    radius: u8,
  ) -> impl Iterator<Item = &TEntryValue> {
    let key = self.create_location_key_unchecked(point);

    Visitor::new(key, radius)
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
  pub fn contains(&self, point: &location::Point) -> bool {
    self.get_value(point).is_some()
  }

  fn insert_entry(
    &mut self,
    entry: BucketEntry<TEntryValue>,
    update_size_check: bool,
  ) -> MutBucketEntry<TEntryValue> {
    match self.get_location(&entry.point, &entry.rotation) {
      None => {
        self.increase_size();
        self.insert_entry(entry, update_size_check)
      }
      Some(location) => {
        let point = entry.point;
        let size = entry.size;
        let inserted = self.store.entry(location.key).or_default().insert(entry);

        if inserted {
          self.locations.insert(location.clone());

          if update_size_check {
            self.update_spacing(size);
          }
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
    point: location::Point,
    size: f32,
    rotation: Option<f32>,
    value: TEntryValue,
  ) -> MutBucketEntry<TEntryValue> {
    self.insert_entry(
      BucketEntry::default()
        .with_point(point)
        .with_value(value)
        .with_size(size)
        .with_rotation(rotation),
      true,
    )
  }

  pub fn get_counter(&self, point: &location::Point, counter: &str) -> Option<&u32> {
    self
      .get_bucket_by_point(point)
      .and_then(|bucket| bucket.get_counter(point, counter))
  }

  pub fn increment_counter(&mut self, point: &location::Point, counter: &str) {
    if let Some(bucket) = self.get_bucket_by_point_mut(point) {
      bucket.increment_counter(point, counter)
    }
  }

  pub fn remove(&mut self, point: &location::Point) {
    if let Some(key) = self.create_location_key(point) {
      let bucket = self
        .get_bucket_by_location_key_mut(&key)
        .expect("Bucket not found while removing point");

      bucket.remove(point);

      if bucket.size() == 0 {
        let location = self
          .get_location_by_key(&key)
          .expect("Location not found while removing bucket");

        self.store.remove(&key);
        self.locations.remove(&location);
      }
    }
  }

  pub fn filter(&self, predicate: impl Fn(&TEntryValue) -> bool) -> Self {
    let mut filtered_grid = Self::new(&self.id)
      .with_resize_method(self.resize_method)
      .with_spacing(self.get_spacing());

    for bucket in self.store.values() {
      for entry in bucket.iter() {
        if predicate(&entry.value) {
          filtered_grid.insert(entry.point, entry.size, entry.rotation, entry.value.clone());
        }
      }
    }

    filtered_grid
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
        if new_spacing > self.get_spacing() {
          self.spacing = Some(new_spacing);
        } else {
          return;
        }
      }
      ResizeMethod::Minimum => {
        if new_spacing < self.get_spacing() {
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
        .remove(&location.point)
        .expect("Bucket entry not found while updating spacing");

      self.insert_entry(
        BucketEntry::default()
          .with_point(location.point)
          .with_value(bucket_entry.value)
          .with_size(bucket_entry.size)
          .with_counters(bucket_entry.counters),
        false,
      );
    }
  }
}
