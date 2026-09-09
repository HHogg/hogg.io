#[path = "./mod_tests.rs"]
#[cfg(test)]
mod tests;

mod v1;
mod v2;

use std::fmt::Display;

use crate::build::Plane;
use crate::TilingError;

use v1::HashV1;
use v2::HashV2;

#[derive(Clone, Debug, Default)]
pub enum Version {
  #[default]
  V1,
  V2,
}

impl std::fmt::Display for Version {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match self {
      Version::V1 => write!(f, "v1"),
      Version::V2 => write!(f, "v2"),
    }
  }
}

pub trait Hash: Display {
  fn build(plane: &Plane) -> Self;
}

pub fn build_hash(plane: &Plane, version: &Version) -> Result<String, TilingError> {
  match version {
    Version::V1 => Ok(HashV1::build(plane).to_string()),
    Version::V2 => {
      let hash = HashV2::build(plane);
      hash.check()?;
      Ok(hash.to_string())
    }
  }
}
