use hogg_circular_sequence::Sequence;
use hogg_geometry::Point;
use hogg_spatial_grid_map::{ utils::radians_equal, Fxx, PI, PI2 };
use ordered_float::OrderedFloat;
use serde::{ Deserialize, Serialize };
use typeshare::typeshare;

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct PointSequence {
  pub sequence: Sequence,
  pub center: Point,
  pub max_size: u8,

  entries: Vec<Entry>,
}

impl PointSequence {
  pub fn with_center(self, center: Point) -> Self {
    PointSequence { center, ..self }
  }

  pub fn with_max_size(self, max_size: u8) -> Self {
    PointSequence { max_size, ..self }
  }

  pub fn size(&self) -> usize {
    self.entries.len()
  }

  pub fn insert(&mut self, point: Point, value: u8) {
    if self.contains_point(&point) {
      return;
    }

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
    hogg_circular_sequence::get_length(&self.sequence) ==
      (self.max_size as usize)
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
