use std::{
  cmp::Ordering,
  collections::{BTreeSet, HashMap},
  ops::{Deref, DerefMut},
};

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use crate::utils::{compare_coordinate, compare_radians, coordinate_equals, normalize_radian};

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[typeshare]
pub struct Bucket<TEntryValue: Clone + Default> {
  #[typeshare(serialized_as = "Vec<BucketEntry<TEntryValue>>")]
  entries: BTreeSet<BucketEntry<TEntryValue>>,
}

impl<TEntryValue: Clone + std::fmt::Debug + Default> Bucket<TEntryValue> {
  pub fn new(point: (f64, f64), value: TEntryValue, size: f32) -> Self {
    Bucket {
      entries: BTreeSet::from([BucketEntry {
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

  pub fn iter_points(&self) -> impl Iterator<Item = &(f64, f64)> {
    self.entries.iter().map(|entry| &entry.point)
  }

  pub fn iter_values(&self) -> impl Iterator<Item = &TEntryValue> {
    self.entries.iter().map(|entry| &entry.value)
  }
  pub fn get_entry_index(&self, point: &(f64, f64)) -> Option<usize> {
    self
      .entries
      .iter()
      .position(|BucketEntry { point: (x, y), .. }| {
        coordinate_equals(*x, point.0) && coordinate_equals(*y, point.1)
      })
  }

  pub fn get_entry(&self, point: &(f64, f64)) -> Option<&BucketEntry<TEntryValue>> {
    self
      .get_entry_index(point)
      .and_then(|index| self.entries.iter().nth(index))
  }

  pub fn get_entry_mut(&mut self, point: &(f64, f64)) -> Option<MutBucketEntry<'_, TEntryValue>> {
    self.remove(point).map(|entry| MutBucketEntry {
      item: entry,
      parent: self,
    })
  }

  pub fn take_entry(&mut self, point: &(f64, f64)) -> Option<BucketEntry<TEntryValue>> {
    self
      .get_entry_index(point)
      .and_then(|index| self.entries.iter().nth(index).cloned())
      .and_then(|entry| self.entries.take(&entry))
  }

  pub fn get_value(&self, point: &(f64, f64)) -> Option<&TEntryValue> {
    self.get_entry(point).map(|entry| &entry.value)
  }

  pub fn contains(&self, point: &(f64, f64)) -> bool {
    self.get_value(point).is_some()
  }

  pub fn insert(&mut self, entry: BucketEntry<TEntryValue>) -> bool {
    if !self.contains(&entry.point) {
      return self.entries.insert(entry);
    }

    false
  }

  pub fn remove(&mut self, point: &(f64, f64)) -> Option<BucketEntry<TEntryValue>> {
    self
      .get_entry(point)
      .cloned()
      .and_then(|entry| self.entries.take(&entry))
  }

  pub fn increment_counter(&mut self, point: &(f64, f64), counter: &str) {
    let mut entry = self
      .get_entry_mut(point)
      .expect("No entry found to increment.");
    let counter = entry.counters.entry(counter.to_string()).or_insert(0);

    *counter += 1;
  }

  pub fn get_counter(&self, point: &(f64, f64), counter: &str) -> Option<&u32> {
    self
      .get_entry(point)
      .and_then(|entry| entry.counters.get(counter))
  }
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[typeshare]
pub struct BucketEntry<TEntryValue: Default> {
  #[typeshare(serialized_as = "Vec<f64>")]
  pub point: (f64, f64),
  pub size: f32,
  pub value: TEntryValue,
  pub counters: HashMap<String, u32>,
}

impl<TEntryValue: Default> BucketEntry<TEntryValue> {
  pub fn with_point(mut self, point: (f64, f64)) -> Self {
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

  pub fn distance_to_center(&self) -> f64 {
    let (x, y) = self.point;
    (x * x + y * y).sqrt()
  }

  pub fn theta(&self) -> f64 {
    let (x, y) = self.point;
    normalize_radian(y.atan2(x))
  }
}

impl<TEntryValue: Clone + Default> Eq for BucketEntry<TEntryValue> {}

impl<TEntryValue: Clone + Default> PartialEq for BucketEntry<TEntryValue> {
  fn eq(&self, other: &Self) -> bool {
    coordinate_equals(self.point.0, other.point.0) && coordinate_equals(self.point.0, other.point.0)
  }
}

impl<TEntryValue: Clone + Default> Ord for BucketEntry<TEntryValue> {
  fn cmp(&self, other: &Self) -> Ordering {
    let theta_comparison = compare_radians(self.theta(), other.theta());

    if theta_comparison != Ordering::Equal {
      return theta_comparison;
    }

    compare_coordinate(self.distance_to_center(), other.distance_to_center())
  }
}

impl<TEntryValue: Clone + Default> PartialOrd for BucketEntry<TEntryValue> {
  fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
    Some(self.cmp(other))
  }
}

// Helper struct to mimic a mutable reference
pub struct MutBucketEntry<'a, TEntryValue: Clone + Default> {
  item: BucketEntry<TEntryValue>,
  parent: &'a mut Bucket<TEntryValue>,
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
    self.parent.entries.insert(item);
  }
}
