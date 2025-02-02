use serde::{Deserialize, Serialize};
use thiserror::Error;
use typeshare::typeshare;

#[derive(Clone, Debug, Deserialize, Error, Serialize)]
#[serde(rename = "ValidationError", tag = "type", content = "content")]
#[typeshare]
pub enum Error {
  #[error("Application error -> {reason}")]
  Application { reason: String },
  #[error("Overall size did not expand")]
  Expansion,
  #[error("Gaps between shapes")]
  Gaps,
  #[error("Shapes overlap")]
  Overlaps,
  #[error("Invalid vertex type -> {sequence}")]
  VertexType { sequence: String },
  #[error("Invalid edge type -> {sequence}")]
  EdgeType { sequence: String },
  #[error("Invalid shape type -> {sequence}")]
  ShapeType { sequence: String },
}
