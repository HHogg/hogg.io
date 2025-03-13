use chrono::{NaiveDateTime, Utc};
use hogg_circular_sequence::SequenceStore;
use serde::Serialize;
use typeshare::typeshare;

use super::Metrics;
use crate::hash::Hash;
use crate::TilingError;

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Result {
  pub notation: String,
  pub repetitions: u8,
  pub error: Option<TilingError>,
  #[typeshare(serialized_as = "string")]
  pub hash: Hash,
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

  pub fn with_repetitions(mut self, repetitions: u8) -> Self {
    self.repetitions = repetitions;
    self
  }

  pub fn with_metrics(mut self, metrics: Metrics) -> Self {
    self.metrics = metrics;
    self
  }

  pub fn with_error(mut self, error: Option<TilingError>) -> Self {
    self.error = error;
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

  pub fn with_hash(mut self, hash: Option<Hash>) -> Self {
    if let Some(hash) = hash {
      self.hash = hash;
    }

    self
  }

  pub fn get_hash(&self) -> String {
    self.hash.to_string()
  }
}

impl Default for Result {
  fn default() -> Self {
    Self {
      notation: String::new(),
      hash: Hash::default(),
      error: None,
      repetitions: 0,
      transform_index: 0,
      timestamp: Utc::now().naive_utc(),
      metrics: Metrics::default(),
      vertex_types: SequenceStore::default(),
      edge_types: SequenceStore::default(),
      shape_types: SequenceStore::default(),
    }
  }
}
