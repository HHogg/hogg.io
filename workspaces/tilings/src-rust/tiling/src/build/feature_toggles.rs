use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

#[derive(Clone, Copy, Debug, Deserialize, Hash, PartialEq, Eq, PartialOrd, Ord, Serialize)]
#[typeshare]
pub enum FeatureToggle {
  Hashing,
  ValidateOverlaps,
  ValidateGaps,
  ValidateExpanded,
  ValidateVertexTypes,
}

impl FeatureToggle {
  pub fn all() -> HashMap<Self, bool> {
    vec![
      (Self::Hashing, false),
      (Self::ValidateOverlaps, false),
      (Self::ValidateGaps, false),
      (Self::ValidateExpanded, false),
      (Self::ValidateVertexTypes, false),
    ]
    .into_iter()
    .collect()
  }
}
