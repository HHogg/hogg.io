use circular_sequence::Sequence;
use serde::{Deserialize, Serialize};
use spatial_grid_map::utils::compare_radians;
use typeshare::typeshare;

use crate::geometry::Point;

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct PointSequence {
  pub sequence: Sequence,
  pub center: Point,
  entries: Vec<Entry>,
  pub size: u8,
}

impl PointSequence {
  pub fn with_center(self, center: Point) -> Self {
    PointSequence { center, ..self }
  }

  pub fn with_size(self, size: u8) -> Self {
    PointSequence { size, ..self }
  }

  pub fn insert(&mut self, point: Point, value: u8) {
    self.entries.push(Entry {
      point,
      value,
      radians: point.radian_to(&self.center),
    });

    self
      .entries
      .sort_by(|a, b| compare_radians(a.radians, b.radians));

    self.sequence = Sequence::default();

    for entry in &self.entries {
      circular_sequence::insert(&mut self.sequence, entry.value);
    }
  }

  pub fn find_where(&self, predicate: impl Fn(&Entry) -> bool) -> Option<&Entry> {
    self.iter().find(|value| predicate(value))
  }

  pub fn iter(&self) -> impl Iterator<Item = &Entry> {
    self.entries.iter()
  }

  pub fn is_complete(&self) -> bool {
    circular_sequence::get_length(&self.sequence) == self.size as usize
  }
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Entry {
  pub point: Point,
  pub value: u8,
  pub radians: f32,
}
