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
      Flag::Overlaps => "validation_overlaps",
      Flag::Gaps => "validation_gaps",
      Flag::Expanded => "validation_expansion",
      Flag::VertexTypes => "validation_vertex_types",
    }
  }
}
