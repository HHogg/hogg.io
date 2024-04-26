use serde::Serialize;
use typeshare::typeshare;

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize)]
#[typeshare]
pub enum Phase {
  Seed,
  Placement,
  Transform,
}

impl Phase {
  pub fn next(&self) -> Option<Self> {
    match self {
      Self::Seed => Some(Self::Placement),
      Self::Placement => Some(Self::Transform),
      Self::Transform => None,
    }
  }
}

impl Default for Phase {
  fn default() -> Self {
    Self::Seed
  }
}
