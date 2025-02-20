use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use crate::validation;

#[derive(Clone, Debug, thiserror::Error, Serialize, Deserialize)]
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
  InvalidTiling(validation::Error),
  #[error("Invalid transform \"{transform}\" -> {reason}")]
  InvalidTransform { transform: String, reason: String },
  #[error("Invalid transform value \"{value}\" -> {reason}")]
  InvalidTransformValue { value: String, reason: String },
  #[error("Invalid vertex type \"{value}\"")]
  InvalidVertexType { value: String },
}

impl From<validation::Error> for TilingError {
  fn from(error: validation::Error) -> Self {
    Self::InvalidTiling(error)
  }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[typeshare]
pub struct ApplicationError {
  pub tiling: String,
  pub reason: String,
}
