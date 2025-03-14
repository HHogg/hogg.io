use hogg_geometry::Point;
use hogg_spatial_grid_map::utils::radians_equal;
use hogg_spatial_grid_map::{Fxx, PI, PI2};
use ordered_float::OrderedFloat;
use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use crate::{get_length, insert, Sequence};

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct PointSequence {
  pub sequence: Sequence,
  pub center: Point,
  pub max_size: u8,

  entries: Vec<Entry>, // BTree?
}

impl PointSequence {
  pub fn with_center(self, center: Point) -> Self {
    PointSequence { center, ..self }
  }

  pub fn with_max_size(self, max_size: u8) -> Self {
    PointSequence { max_size, ..self }
  }

  pub fn update_max_size(&mut self, max_size: u8) {
    self.max_size = max_size;
  }

  pub fn size(&self) -> usize {
    self.entries.len()
  }

  pub fn insert(&mut self, point: Point, value: u8) -> bool {
    if self.contains_point(&point) {
      return false;
    }

    self.entries.push(Entry {
      point,
      value,
      radians: OrderedFloat(point.radian_to(&self.center)),
    });

    self.entries.sort_by(|a, b| a.radians.cmp(&b.radians));
    self.sequence = Sequence::default();

    for entry in &self.entries {
      insert(&mut self.sequence, entry.value);
    }

    true
  }

  pub fn iter(&self) -> impl Iterator<Item = &Entry> {
    self.entries.iter()
  }

  pub fn find(&self, predicate: impl Fn(&Entry) -> bool) -> Option<&Entry> {
    self.iter().find(|value| predicate(value))
  }

  pub fn find_by_point(&self, point: &Point) -> Option<&Entry> {
    self.find(|entry| entry.point == *point)
  }

  pub fn find_by_radians(&self, radians: Fxx) -> Option<&Entry> {
    self.find(|entry| radians_equal(entry.radians.into_inner(), radians))
  }

  pub fn find_opposite(&self, point: &Point) -> Option<&Entry> {
    self.find_by_radians((point.radian_to(&self.center) + PI) % PI2)
  }

  pub fn contains_point(&self, point: &Point) -> bool {
    self.find_by_point(point).is_some()
  }

  pub fn is_complete(&self) -> bool {
    get_length(&self.sequence) == (self.max_size as usize)
  }
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Entry {
  pub point: Point,
  pub value: u8,
  #[typeshare(serialized_as = "Fxx")]
  pub radians: OrderedFloat<Fxx>,
}
