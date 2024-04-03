use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use crate::ValidationError;

#[derive(Clone, Debug, thiserror::Error, Serialize, Deserialize)]
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
  #[error("")]
  Noop,
}

impl TilingError {
  pub fn is_empty(&self) -> bool {
    matches!(self, Self::Noop)
  }
}

impl Default for TilingError {
  fn default() -> Self {
    Self::Noop
  }
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
