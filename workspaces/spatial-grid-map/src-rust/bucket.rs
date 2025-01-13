use std::{
  collections::HashMap,
  ops::{Deref, DerefMut},
};

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use crate::{
  location,
  utils::{coordinate_equals, normalize_radian},
};

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[typeshare]
pub struct Bucket<TEntryValue: Clone + Default> {
  #[typeshare(serialized_as = "Vec<BucketEntry<TEntryValue>>")]
  pub entries: Vec<BucketEntry<TEntryValue>>,
}

impl<TEntryValue: Clone + std::fmt::Debug + Default> Bucket<TEntryValue> {
  pub fn new(point: location::Point, value: TEntryValue, size: f32) -> Self {
    Bucket {
      entries: Vec::from([BucketEntry {
        point,
        value,
        size,
        counters: HashMap::new(),
      }]),
    }
  }

  pub fn size(&self) -> usize {
    self.entries.len()
  }

  pub fn iter(&self) -> impl Iterator<Item = &BucketEntry<TEntryValue>> {
    self.entries.iter()
  }

  pub fn iter_points(&self) -> impl Iterator<Item = &location::Point> {
    self.entries.iter().map(|entry| &entry.point)
  }

  pub fn iter_values(&self) -> impl Iterator<Item = &TEntryValue> {
    self.entries.iter().map(|entry| &entry.value)
  }
  pub fn get_entry_index(&self, point: &location::Point) -> Option<usize> {
    self.entries.iter().position(
      |BucketEntry {
         point: location::Point(x, y),
         ..
       }| { coordinate_equals(*x, point.0) && coordinate_equals(*y, point.1) },
    )
  }

  pub fn get_entry(&self, point: &location::Point) -> Option<&BucketEntry<TEntryValue>> {
    self
      .get_entry_index(point)
      .and_then(|index| self.entries.get(index))
  }

  pub fn get_entry_mut(
    &mut self,
    point: &location::Point,
  ) -> Option<MutBucketEntry<'_, TEntryValue>> {
    self.remove(point).map(|entry| MutBucketEntry {
      item: entry,
      parent: self,
    })
  }

  pub fn get_value(&self, point: &location::Point) -> Option<&TEntryValue> {
    self.get_entry(point).map(|entry| &entry.value)
  }

  pub fn contains(&self, point: &location::Point) -> bool {
    self.get_value(point).is_some()
  }

  pub fn insert(&mut self, entry: BucketEntry<TEntryValue>) -> bool {
    if self.contains(&entry.point) {
      return false;
    }

    self.entries.push(entry);
    true
  }

  pub fn remove(&mut self, point: &location::Point) -> Option<BucketEntry<TEntryValue>> {
    self
      .get_entry_index(point)
      .map(|index| self.entries.remove(index))
  }

  pub fn increment_counter(&mut self, point: &location::Point, counter: &str) {
    let mut entry = self
      .get_entry_mut(point)
      .expect("No entry found to increment.");
    let counter = entry.counters.entry(counter.to_string()).or_insert(0);

    *counter += 1;
  }

  pub fn get_counter(&self, point: &location::Point, counter: &str) -> Option<&u32> {
    self
      .get_entry(point)
      .and_then(|entry| entry.counters.get(counter))
  }
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[typeshare]
pub struct BucketEntry<TEntryValue: Default> {
  #[typeshare(serialized_as = "Vec<f32>")]
  pub point: location::Point,
  pub size: f32,
  pub value: TEntryValue,
  pub counters: HashMap<String, u32>,
}

impl<TEntryValue: Default> BucketEntry<TEntryValue> {
  pub fn with_point(mut self, point: location::Point) -> Self {
    self.point = point;
    self
  }

  pub fn with_size(mut self, size: f32) -> Self {
    self.size = size;
    self
  }

  pub fn with_value(mut self, value: TEntryValue) -> Self {
    self.value = value;
    self
  }

  pub fn with_counters(mut self, counters: HashMap<String, u32>) -> Self {
    self.counters = counters;
    self
  }

  pub fn distance_to_center(&self) -> f32 {
    let location::Point(x, y) = self.point;
    (x * x + y * y).sqrt()
  }

  pub fn theta(&self) -> f32 {
    let location::Point(x, y) = self.point;
    normalize_radian(y.atan2(x))
  }

  pub fn increment_counter(&mut self, key: &str) {
    let counter = self.counters.entry(key.to_string()).or_insert(0);
    *counter += 1;
  }
}

// Helper struct to mimic a mutable reference
pub struct MutBucketEntry<'a, TEntryValue: Clone + Default> {
  pub item: BucketEntry<TEntryValue>,
  pub parent: &'a mut Bucket<TEntryValue>,
}

impl<TEntryValue: Clone + Default> Deref for MutBucketEntry<'_, TEntryValue> {
  type Target = BucketEntry<TEntryValue>;

  fn deref(&self) -> &Self::Target {
    &self.item
  }
}

impl<TEntryValue: Clone + Default> DerefMut for MutBucketEntry<'_, TEntryValue> {
  fn deref_mut(&mut self) -> &mut Self::Target {
    &mut self.item
  }
}

// Reinserts the item into the BTreeSet when `MutEntry` is dropped
impl<TEntryValue: Clone + Default> Drop for MutBucketEntry<'_, TEntryValue> {
  fn drop(&mut self) {
    let item = std::mem::take(&mut self.item);
    self.parent.entries.push(item);
  }
}
