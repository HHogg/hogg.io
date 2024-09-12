use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use crate::utils::coordinate_equals;

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[typeshare]
pub struct Bucket<TEntryValue> {
  entries: Vec<BucketEntry<TEntryValue>>,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[typeshare]
pub struct BucketEntry<TEntryValue> {
  #[typeshare(serialized_as = "Vec<f64>")]
  pub point: (f64, f64),
  pub value: TEntryValue,
  pub counters: HashMap<String, u32>,
}

impl<TEntryValue: std::fmt::Debug> Bucket<TEntryValue> {
  pub fn new(point: (f64, f64), value: TEntryValue) -> Self {
    Bucket {
      entries: vec![BucketEntry {
        point,
        value,
        counters: HashMap::new(),
      }],
    }
  }

  pub fn size(&self) -> usize {
    self.entries.len()
  }

  pub fn iter(&self) -> impl Iterator<Item = &BucketEntry<TEntryValue>> {
    self.entries.iter()
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
      .map(|index| &self.entries[index])
  }

  pub fn get_entry_mut(&mut self, point: &(f64, f64)) -> Option<&mut BucketEntry<TEntryValue>> {
    self
      .get_entry_index(point)
      .map(move |index| &mut self.entries[index])
  }

  pub fn get_value(&self, point: &(f64, f64)) -> Option<&TEntryValue> {
    self.get_entry(point).map(|entry| &entry.value)
  }

  pub fn get_value_mut(&mut self, point: &(f64, f64)) -> Option<&mut TEntryValue> {
    self.get_entry_mut(point).map(|entry| &mut entry.value)
  }

  pub fn contains(&self, point: &(f64, f64)) -> bool {
    self.get_value(point).is_some()
  }

  pub fn insert(&mut self, point: (f64, f64), value: TEntryValue) -> Option<&mut TEntryValue> {
    if !self.contains(&point) {
      let entry = BucketEntry {
        point,
        value,
        counters: HashMap::new(),
      };

      self.entries.push(entry);
    }

    self.get_value_mut(&point)
  }

  pub fn remove(&mut self, point: &(f64, f64)) -> Option<TEntryValue> {
    self
      .get_entry_index(point)
      .map(|index| self.entries.remove(index).value)
  }

  pub fn increment_counter(&mut self, point: &(f64, f64), counter: &str) {
    let entry = self
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
