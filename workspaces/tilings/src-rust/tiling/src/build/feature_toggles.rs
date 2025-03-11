use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

#[derive(Clone, Copy, Debug, Deserialize, Hash, PartialEq, Eq, PartialOrd, Ord, Serialize)]
#[typeshare]
pub enum FeatureToggle {
  Hashing,
  ValidateOverlaps,
  ValidateGaps,
  ValidateVertexTypes,
}

impl FeatureToggle {
  pub fn all() -> HashMap<Self, bool> {
    vec![
      (Self::Hashing, true),
      (Self::ValidateOverlaps, true),
      (Self::ValidateGaps, true),
      (Self::ValidateVertexTypes, true),
    ]
    .into_iter()
    .collect()
  }
}

impl From<FeatureToggle> for &'static str {
  fn from(feature_toggle: FeatureToggle) -> Self {
    match feature_toggle {
      FeatureToggle::Hashing => "Hashing",
      FeatureToggle::ValidateOverlaps => "ValidateOverlaps",
      FeatureToggle::ValidateGaps => "ValidateGaps",
      FeatureToggle::ValidateVertexTypes => "ValidateVertexTypes",
    }
  }
}
