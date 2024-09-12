use serde::{Deserialize, Serialize};
use typeshare::typeshare;

#[derive(Debug, Clone, Copy, Hash, PartialEq, Eq, PartialOrd, Ord, Deserialize, Serialize)]
#[typeshare]
#[serde(tag = "type", content = "index")]
pub enum Phase {
  Seed,
  Placement,
  Transform(u32),
}

impl Phase {
  pub fn next(&self) -> Option<Self> {
    match self {
      Self::Seed => Some(Self::Placement),
      Self::Placement => Some(Self::Transform(0)),
      Self::Transform(index) => Some(Self::Transform(index + 1)),
    }
  }
}

impl Default for Phase {
  fn default() -> Self {
    Self::Seed
  }
}
