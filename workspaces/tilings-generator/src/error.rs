use serde::{Deserialize, Serialize};
use thiserror::Error;
use typeshare::typeshare;

#[derive(Clone, Debug, Error, Serialize, Deserialize)]
#[serde(tag = "name", content = "data")]
#[typeshare]
pub enum TilingError {
  #[error("Application error -> {reason}")]
  Application { reason: String },
  #[error("Invalid notation \"{notation}\" -> {reason}")]
  InvalidNotation { notation: String, reason: String },
  #[error("Invalid offset \"{offset}\" -> {reason}")]
  InvalidOffset { offset: String, reason: String },
  #[error("Invalid operation \"{operation}\" -> {reason}")]
  InvalidOperation { operation: String, reason: String },
  #[error("Invalid origin index \"{origin_index}\" -> {reason}")]
  InvalidOriginIndex {
    origin_index: String,
    reason: String,
  },
  #[error("Invalid origin type \"{origin_type}\" -> {reason}")]
  InvalidOriginType { origin_type: String, reason: String },
  #[error("Invalid shape \"{shape}\" -> {reason}")]
  InvalidShape { shape: String, reason: String },
  #[error("Invalid shape group \"{group}\" -> {reason}")]
  InvalidShapeGroup { group: String, reason: String },
  #[error("Invalid shape \"{shape}\" in group \"{group}\" -> {reason}")]
  InvalidShapeInGroup {
    shape: String,
    group: String,
    reason: String,
  },
  #[error("Invalid state -> {reason}")]
  InvalidState { reason: String },
  #[error("Invalid tiling -> {0}")]
  InvalidTiling(ValidationError),
  #[error("Invalid transform \"{transform}\" -> {reason}")]
  InvalidTransform { transform: String, reason: String },
  #[error("Invalid transform value \"{value}\" -> {reason}")]
  InvalidTransformValue { value: String, reason: String },
  #[error("Invalid vertex type \"{value}\"")]
  InvalidVertexType { value: String },
}

impl From<ValidationError> for TilingError {
  fn from(error: ValidationError) -> Self {
    Self::InvalidTiling(error)
  }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[typeshare]
pub struct ApplicationError {
  pub tiling: String,
  pub reason: String,
}

#[derive(Clone, Debug, Deserialize, Error, Serialize)]
#[serde(tag = "type", content = "content")]
#[typeshare]
pub enum ValidationError {
  #[error("Application error -> {reason}")]
  Application { reason: String },
  #[error("Gaps between shapes")]
  Gaps,
  #[error("Shapes overlap -> {reason}")]
  Overlaps { reason: String },
  #[error("Invalid vertex type -> {reason}")]
  VertexType { reason: String },
  #[error("Invalid edge type -> {sequence}")]
  EdgeType { sequence: String },
  #[error("Invalid shape type -> {sequence}")]
  ShapeType { sequence: String },
}
