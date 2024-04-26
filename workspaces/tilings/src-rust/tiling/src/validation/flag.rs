use serde::{Deserialize, Serialize};
use typeshare::typeshare;

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename = "ValidationFlag")]
#[typeshare]
pub enum Flag {
  Overlaps,
  Gaps,
  Expansion,
  VertexTypes,
  EdgeTypes,
  ShapeTypes,
}

impl Flag {
  pub fn all() -> Vec<Self> {
    vec![
      Self::Overlaps,
      Self::Gaps,
      Self::Expansion,
      Self::VertexTypes,
      Self::EdgeTypes,
      Self::ShapeTypes,
    ]
  }
}
