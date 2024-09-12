use chrono::{NaiveDateTime, Utc};
use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use super::Metrics;

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Result {
  pub notation: String,
  pub hash: String,
  pub transform_index: i32,
  pub uniform: i32,
  #[typeshare(serialized_as = "string")]
  pub timestamp: NaiveDateTime,
  pub metrics: Metrics,
}

impl Result {
  pub fn with_metrics(mut self, metrics: Metrics) -> Self {
    self.metrics = metrics;
    self
  }

  pub fn with_hash(mut self, hash: String) -> Self {
    self.hash = hash;
    self
  }

  pub fn with_notation(mut self, notation: String) -> Self {
    self.notation = notation.clone();
    self
  }

  pub fn with_transform_index(mut self, transform_index: i32) -> Self {
    self.transform_index = transform_index;
    self
  }
}

impl Default for Result {
  fn default() -> Self {
    Self {
      notation: String::new(),
      hash: String::new(),
      transform_index: 0,
      uniform: 0,
      timestamp: Utc::now().naive_utc(),
      metrics: Metrics::default(),
    }
  }
}
