use serde::{Deserialize, Serialize};
use typeshare::typeshare;

#[derive(Debug, Clone, Copy, Hash, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
#[typeshare]
#[serde(tag = "type", content = "index")]
pub enum Stage {
  Seed,
  Placement,
  Transform { index: u8, repetition_index: u8 },
}

impl Stage {
  pub fn next(&self) -> Option<Self> {
    match self {
      Self::Seed => Some(Self::Placement),
      Self::Placement => Some(Self::Transform {
        index: 0,
        repetition_index: 0,
      }),
      Self::Transform {
        index,
        repetition_index,
      } => Some(Self::Transform {
        index: index + 1,
        repetition_index: *repetition_index,
      }),
    }
  }
}

impl Default for Stage {
  fn default() -> Self {
    Self::Seed
  }
}

impl std::fmt::Display for Stage {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match self {
      Stage::Seed => write!(f, "seed"),
      Stage::Placement => write!(f, "placement"),
      Stage::Transform { index, .. } => write!(f, "transform_{}", index),
    }
  }
}
