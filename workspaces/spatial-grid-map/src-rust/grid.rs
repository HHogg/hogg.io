#[path = "./grid_tests.rs"]
#[cfg(test)]
mod grid_tests;

use std::collections::{BTreeSet, HashMap};
use std::mem;

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use crate::bucket::{Bucket, BucketEntry, MutBucketEntry};
use crate::location::{self, Location};
use crate::visitor::Visitor;
use crate::Fxx;

#[derive(Debug, Clone, Copy, Deserialize, Serialize)]
#[typeshare]
pub enum ResizeMethod {
  First,
  Fixed,
  Maximum,
  Minimum,
}

impl Default for ResizeMethod {
  fn default() -> Self {
    Self::First
  }
}

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
#[typeshare]
pub struct SpatialGridMap<TEntryValue: Clone + std::fmt::Debug + Default> {
  id: String,
  /// Sorted set of all occupied locations in the grid.
  #[typeshare(serialized_as = "Vec<Location>")]
  locations: BTreeSet<Location>,
  /// The minimum location in the grid.
  location_min: Option<location::Point>,
  /// The maximum location in the grid.
  location_max: Option<location::Point>,
  /// Resizing
  resize_method: ResizeMethod,
  /// Bucket store.
  #[typeshare(serialized_as = "Map<Vec<i32>, Bucket<TEntryValue>>")]
  store: HashMap<location::Key, Bucket<TEntryValue>>,
  /// The amount of space each bit represents in the grid.
  spacing: Option<Fxx>,
}

impl<TEntryValue: Clone + std::fmt::Debug + Default> SpatialGridMap<TEntryValue> {
  pub fn new(id: &str) -> Self {
    SpatialGridMap {
      id: id.to_string(),
      resize_method: ResizeMethod::First,
      store: HashMap::new(),

      spacing: None,

      locations: BTreeSet::new(),
      location_min: None,
      location_max: None,
    }
  }

  pub fn with_resize_method(mut self, resize_method: ResizeMethod) -> Self {
    self.resize_method = resize_method;
    self
  }

  pub fn with_spacing(mut self, spacing: Fxx) -> Self {
    self.spacing = Some(spacing);
    self
  }

  pub fn get_spacing(&self) -> Fxx {
    self.spacing.unwrap_or(1.0)
  }

  pub fn get_grid_size(&self) -> u64 {
    if let (Some(min), Some(max)) = (self.location_min, self.location_max) {
      let x = min.0.abs().max(max.0.abs());
      let y = min.1.abs().max(max.1.abs());

      x.max(y).ceil() as u64
    } else {
      0
    }
  }

  fn get_location(&self, point: &location::Point, rotation: &Option<Fxx>) -> Location {
    Location::new(self.get_spacing(), *point, *rotation)
  }

  pub fn get_bucket_by_location_key(&self, key: &location::Key) -> Option<&Bucket<TEntryValue>> {
    self.store.get(key)
  }

  fn get_bucket_by_location_key_mut(
    &mut self,
    key: &location::Key,
  ) -> Option<&mut Bucket<TEntryValue>> {
    self.store.get_mut(key)
  }

  pub fn create_location_key(&self, point: &location::Point) -> location::Key {
    Location::get_key(self.get_spacing(), *point)
  }

  fn get_location_by_key(&self, key: &location::Key) -> Option<Location> {
    self
      .locations
      .iter()
      .find(|location| location.key == *key)
      .cloned()
  }

  pub fn get_bucket_by_point(&self, point: &location::Point) -> Option<&Bucket<TEntryValue>> {
    self.get_bucket_by_location_key(&self.create_location_key(point))
  }

  fn get_bucket_by_point_mut(
    &mut self,
    point: &location::Point,
  ) -> Option<&mut Bucket<TEntryValue>> {
    self.get_bucket_by_location_key_mut(&self.create_location_key(point))
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

  pub fn iter_entries(&self) -> impl Iterator<Item = &BucketEntry<TEntryValue>> {
    self.store.values().flat_map(|bucket| bucket.iter())
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
    let key = self.create_location_key(point);

    Visitor::new(key, radius)
      .filter_map(move |key| self.store.get(&key))
      .flat_map(|bucket| bucket.iter_values())
  }

  pub fn first(&self) -> Option<&TEntryValue> {
    self.iter_values().next()
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

  fn insert_entry(&mut self, entry: BucketEntry<TEntryValue>, update_size_check: bool) -> bool {
    let BucketEntry {
      point,
      rotation,
      size,
      ..
    } = entry;

    let location = self.get_location(&point, &rotation);
    let inserted = self.store.entry(location.key).or_default().insert(entry);

    if inserted {
      self.locations.insert(location.clone());

      self.update_location_bounds(&location);

      if update_size_check {
        self.update_spacing(size);
      }
    }

    inserted
  }

  /// Inserts a point into the grid, returning false if it's already present.
  /// If the grid is too small, it will be increased to fit the new centroid.
  pub fn insert(
    &mut self,
    point: location::Point,
    size: Fxx,
    rotation: Option<Fxx>,
    value: TEntryValue,
  ) -> bool {
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

  pub fn has_visited(&self, point: &location::Point) -> &bool {
    self
      .get_bucket_by_point(point)
      .and_then(|bucket| bucket.get_bool_state(point, "visited"))
      .unwrap_or(&false)
  }

  pub fn visit(&mut self, point: &location::Point) {
    if let Some(bucket) = self.get_bucket_by_point_mut(point) {
      bucket.set_bool_state(point, "visited", true)
    }
  }

  pub fn take(&mut self, point: &location::Point) -> Option<TEntryValue> {
    let key = self.create_location_key(point);

    if let Some(bucket) = self.get_bucket_by_location_key_mut(&key) {
      let entry = bucket.remove(point)?;

      if bucket.size() == 0 {
        let location = self
          .get_location_by_key(&key)
          .expect("Location not found while taking bucket");

        self.store.remove(&key);
        self.locations.remove(&location);
      }

      return Some(entry.value);
    }

    None
  }

  pub fn remove(&mut self, point: &location::Point) {
    self.take(point);
  }

  pub fn filter_map<T: Clone + std::fmt::Debug + Default>(
    &self,
    f: impl Fn(&TEntryValue) -> Option<T>,
  ) -> SpatialGridMap<T> {
    let mut mapped_grid = SpatialGridMap::new(&self.id)
      .with_resize_method(self.resize_method)
      .with_spacing(self.get_spacing());

    for bucket in self.store.values() {
      for entry in bucket.iter() {
        if let Some(value) = f(&entry.value) {
          mapped_grid.insert(entry.point, entry.size, entry.rotation, value);
        }
      }
    }

    mapped_grid
  }

  pub fn filter(&self, predicate: impl Fn(&TEntryValue) -> bool) -> Self {
    self.filter_map(|value| {
      if predicate(value) {
        Some(value.clone())
      } else {
        None
      }
    })
  }

  fn update_location_bounds(&mut self, location: &Location) {
    if let Some(min) = self.location_min {
      self.location_min = Some(location::Point(
        location.point.0.min(min.0),
        location.point.1.min(min.1),
      ));
    } else {
      self.location_min = Some(location.point);
    }

    if let Some(max) = self.location_max {
      self.location_max = Some(location::Point(
        location.point.0.max(max.0),
        location.point.1.max(max.1),
      ));
    } else {
      self.location_max = Some(location.point);
    }
  }

  fn update_spacing(&mut self, new_spacing: Fxx) {
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
