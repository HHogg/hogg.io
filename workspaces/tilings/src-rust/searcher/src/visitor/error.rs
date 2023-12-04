use serde::{Deserialize, Serialize};
use tiling::TilingError;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum VisitError {
  InvalidTiling(TilingError),
}

impl From<TilingError> for VisitError {
  fn from(error: TilingError) -> Self {
    Self::InvalidTiling(error)
  }
}
