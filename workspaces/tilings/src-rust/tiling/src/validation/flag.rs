use serde::{Deserialize, Serialize};
use typeshare::typeshare;

#[derive(Clone, Copy, Debug, Deserialize, Hash, PartialEq, Eq, PartialOrd, Ord, Serialize)]
#[typeshare]
pub enum Flag {
  Overlaps,
  Gaps,
  Expanded,
  VertexTypes,
}

impl Flag {
  pub fn all() -> Vec<Self> {
    vec![
      Self::Overlaps,
      Self::Gaps,
      Self::Expanded,
      Self::VertexTypes,
    ]
  }
}

impl From<Flag> for &'static str {
  fn from(flag: Flag) -> Self {
    match flag {
      Flag::Overlaps => "validation_Overlaps",
      Flag::Gaps => "validation_Gaps",
      Flag::Expanded => "validation_Expanded",
      Flag::VertexTypes => "validation_VertexTypes",
    }
  }
}
