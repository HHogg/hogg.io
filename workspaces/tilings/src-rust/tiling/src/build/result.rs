use chrono::{NaiveDateTime, Utc};
use serde::Serialize;
use typeshare::typeshare;

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Result {
  pub notation: String,
  pub uid: String,
  pub transform_index: i32,
  pub uniform: i32,
  #[typeshare(serialized_as = "string")]
  pub timestamp: NaiveDateTime,
}

impl Result {
  pub fn with_notation(mut self, notation: String) -> Self {
    self.notation = notation.clone();
    self
  }

  pub fn with_uid(mut self, uid: String) -> Self {
    self.uid = uid;
    self
  }

  pub fn with_transform_index(mut self, transform_index: usize) -> Self {
    self.transform_index = transform_index as i32;
    self
  }
}

impl Default for Result {
  fn default() -> Self {
    Self {
      notation: String::new(),
      uid: String::new(),
      transform_index: 0,
      uniform: 0,
      timestamp: Utc::now().naive_utc(),
    }
  }
}
