use std::fmt::Display;

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use super::{Operation, Path, TilingError, TransformValue};
use crate::path::Direction;

///
#[derive(Clone, Debug, Default, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct TransformContinuous {
  pub operation: Operation,
  pub value: TransformValue,
}

impl TransformContinuous {
  pub fn first(path: &Path, direction: &Direction) -> Result<Self, TilingError> {
    let mut transform = Self::from_path(path)?;
    let seed = path.get_seed().ok_or(TilingError::Application {
      reason: "attempted to create a continuous transform without a path".into(),
    })?;

    transform.operation = Operation::first(direction);
    transform.value = TransformValue::first(transform.operation, *seed, direction);

    Ok(transform)
  }

  pub fn from_path(path: &Path) -> Result<Self, TilingError> {
    let operation = Operation::default();
    let seed = path.get_seed().ok_or(TilingError::Application {
      reason: "attempted to create a continuous transform without a path".into(),
    })?;

    Ok(Self {
      operation: Operation::default(),
      value: TransformValue::default()
        .with_seed(*seed)
        .with_operation(operation),
    })
  }

  pub fn previous_transform(&mut self) -> Option<Self> {
    if let Some(value) = self.value.previous_value() {
      self.value = value;
      return Some(self.clone());
    }

    if let Some(operation) = self.operation.previous() {
      self.operation = operation;
      self.value = TransformValue::first(operation, self.value.seed, &Direction::FromEnd);
      return Some(self.clone());
    }

    None
  }

  pub fn next_transform(&mut self) -> Option<Self> {
    if let Some(value) = self.value.next_value() {
      self.value = value;
      return Some(self.clone());
    }

    if let Some(operation) = self.operation.next() {
      self.operation = operation;
      self.value = TransformValue::first(operation, self.value.seed, &Direction::FromStart);
      return Some(self.clone());
    }

    None
  }
}

impl Display for TransformContinuous {
  fn fmt(&self, fmt: &mut std::fmt::Formatter) -> Result<(), std::fmt::Error> {
    write!(fmt, "{}{}", self.operation, self.value)
  }
}
