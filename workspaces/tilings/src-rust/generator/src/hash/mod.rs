#[path = "./hash_tests.rs"]
#[cfg(test)]
mod tests;

use serde::{Serialize, Serializer};
use sha2::{Digest, Sha256};

use crate::build::Plane;
use crate::TilingError;

mod canonical;
mod error;
mod isometry;
mod quotient;

const FORMAT_VERSION: u8 = 1;

#[derive(Clone, Debug, Default)]
pub struct Hash {
  state: State,
}

#[derive(Clone, Debug, Default)]
enum State {
  #[default]
  Empty,
  Ready {
    display: String,
    _canonical: Vec<u8>,
  },
  Failed(error::Error),
}

impl Hash {
  pub fn build(plane: &Plane) -> Self {
    let state = match canonical::build(plane, &plane.resolved_symmetries) {
      Ok(bytes) => State::Ready {
        display: format_display(&bytes),
        _canonical: bytes,
      },
      Err(error) => State::Failed(error),
    };

    Self { state }
  }

  pub(crate) fn check(&self) -> Result<(), TilingError> {
    match &self.state {
      State::Failed(error) => Err(TilingError::InvalidState {
        reason: format!("hash construction failed: {error}"),
      }),
      State::Empty | State::Ready { .. } => Ok(()),
    }
  }
}

fn format_display(canonical: &[u8]) -> String {
  let digest = Sha256::digest(canonical);

  format!("th{FORMAT_VERSION}:{}", hex::encode(digest))
}

impl std::fmt::Display for Hash {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match &self.state {
      State::Ready { display, .. } => f.write_str(display),
      State::Empty | State::Failed(_) => Ok(()),
    }
  }
}

impl Serialize for Hash {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
    S: Serializer,
  {
    serializer.serialize_str(&self.to_string())
  }
}
