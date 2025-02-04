use hogg_geometry::Point;
use hogg_circular_sequence::Sequence;
use ordered_float::OrderedFloat;
use serde::{Deserialize, Serialize};
use typeshare::typeshare;

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct PointSequence {
  pub sequence: Sequence,
  pub center: Point,
  pub size: u8,

  entries: Vec<Entry>,
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
      radians: OrderedFloat(point.radian_to(&self.center)),
    });

    self.entries.sort_by(|a, b| a.radians.cmp(&b.radians));
    self.sequence = Sequence::default();

    for entry in &self.entries {
      hogg_circular_sequence::insert(&mut self.sequence, entry.value);
    }
  }

  pub fn find(&self, predicate: impl Fn(&Entry) -> bool) -> Option<&Entry> {
    self.iter().find(|value| predicate(value))
  }

  pub fn iter(&self) -> impl Iterator<Item = &Entry> {
    self.entries.iter()
  }

  pub fn is_complete(&self) -> bool {
    hogg_circular_sequence::get_length(&self.sequence) == self.size as usize
  }
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Entry {
  pub point: Point,
  pub value: u8,
  #[typeshare(serialized_as = "f32")]
  pub radians: OrderedFloat<f32>,
}
