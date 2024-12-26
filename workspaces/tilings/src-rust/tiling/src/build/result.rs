use chrono::{NaiveDateTime, Utc};
use circular_sequence::SequenceStore;
use serde::Serialize;
use typeshare::typeshare;

use crate::{Tiling, TilingError};

use super::Metrics;

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Result {
  pub notation: String,
  pub expansion_phases: u8,
  pub error: Option<TilingError>,
  pub transform_index: i32,
  #[typeshare(serialized_as = "string")]
  pub timestamp: NaiveDateTime,
  pub metrics: Metrics,
  #[typeshare(serialized_as = "Vec<String>")]
  pub vertex_types: SequenceStore,
  #[typeshare(serialized_as = "Vec<String>")]
  pub edge_types: SequenceStore,
  #[typeshare(serialized_as = "Vec<String>")]
  pub shape_types: SequenceStore,
}

impl Result {
  pub fn with_notation(mut self, notation: String) -> Self {
    self.notation = notation.clone();
    self
  }

  pub fn with_expansion_phases(mut self, expansion_phases: u8) -> Self {
    self.expansion_phases = expansion_phases;
    self
  }

  pub fn with_metrics(mut self, metrics: Metrics) -> Self {
    self.metrics = metrics;
    self
  }

  pub fn with_error(mut self, error: TilingError) -> Self {
    self.error = Some(error.clone());
    self
  }

  pub fn with_transform_index(mut self, transform_index: i32) -> Self {
    self.transform_index = transform_index;
    self
  }

  pub fn with_vertex_types(mut self, vertex_types: SequenceStore) -> Self {
    self.vertex_types = vertex_types;
    self
  }

  pub fn with_edge_types(mut self, edge_types: SequenceStore) -> Self {
    self.edge_types = edge_types;
    self
  }

  pub fn with_shape_types(mut self, shape_types: SequenceStore) -> Self {
    self.shape_types = shape_types;
    self
  }

  pub fn create_hash(self) -> Self {
    self
  }

  pub fn get_hash(&self) -> String {
    String::new()
  }
}

impl Default for Result {
  fn default() -> Self {
    Self {
      notation: String::new(),
      error: None,
      expansion_phases: 0,
      transform_index: 0,
      timestamp: Utc::now().naive_utc(),
      metrics: Metrics::default(),
      vertex_types: SequenceStore::default(),
      edge_types: SequenceStore::default(),
      shape_types: SequenceStore::default(),
    }
  }
}

impl From<&mut Tiling> for Result {
  fn from(tiling: &mut Tiling) -> Self {
    Self::default()
      .with_notation(tiling.notation.to_string())
      .with_expansion_phases(tiling.plane.expansion_phases)
      .with_transform_index(tiling.notation.transforms.index)
      .with_metrics(tiling.plane.metrics.clone())
      .with_vertex_types(tiling.plane.get_vertex_types())
      .with_edge_types(tiling.plane.get_edge_types())
      .with_shape_types(tiling.plane.get_shape_types())
      .create_hash()
  }
}
