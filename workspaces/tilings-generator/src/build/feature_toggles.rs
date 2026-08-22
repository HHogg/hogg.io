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
  pub fn all() -> [Self; 4] {
    [
      Self::Hashing,
      Self::ValidateOverlaps,
      Self::ValidateGaps,
      Self::ValidateVertexTypes,
    ]
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
