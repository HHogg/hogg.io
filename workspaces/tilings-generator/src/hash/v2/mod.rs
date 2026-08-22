use serde::{Serialize, Serializer};

use super::Hash;
use crate::build::Plane;

#[derive(Clone, Debug, Default)]
pub struct HashV2 {}

impl Hash for HashV2 {
  fn build(_plane: &Plane) -> Self {
    let hash = HashV2::default();
    hash
  }
}

impl std::fmt::Display for HashV2 {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "",)
  }
}

impl Serialize for HashV2 {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
    S: Serializer,
  {
    serializer.serialize_str(&self.to_string())
  }
}
