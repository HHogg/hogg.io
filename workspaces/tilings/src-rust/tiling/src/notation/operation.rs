use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use super::Direction;
use crate::TilingError;

#[derive(Clone, Copy, Debug, Deserialize, Eq, Hash, PartialEq, Serialize)]
#[typeshare]
pub enum Operation {
  Reflect,
  Rotate,
}

impl Operation {
  pub fn first(direction: &Direction) -> Self {
    match direction {
      Direction::FromStart => Self::Reflect,
      Direction::FromEnd => Self::Rotate,
    }
  }

  pub fn previous(&self) -> Option<Self> {
    match self {
      Self::Reflect => None,
      Self::Rotate => Some(Self::Reflect),
    }
  }

  pub fn next(&self) -> Option<Self> {
    match self {
      Self::Reflect => Some(Self::Rotate),
      Self::Rotate => None,
    }
  }
}

impl Default for Operation {
  fn default() -> Self {
    Self::Reflect
  }
}

impl std::fmt::Display for Operation {
  fn fmt(&self, fmt: &mut std::fmt::Formatter) -> Result<(), std::fmt::Error> {
    write!(
      fmt,
      "{}",
      match *self {
        Self::Reflect => "m",
        Self::Rotate => "r",
      }
    )
  }
}

impl std::str::FromStr for Operation {
  type Err = TilingError;

  fn from_str(value: &str) -> Result<Self, Self::Err> {
    match value {
      "m" => Ok(Self::Reflect),
      "r" => Ok(Self::Rotate),
      _ => {
        Err(TilingError::InvalidOperation {
          operation: value.to_string(),
          reason: "invalid".into(),
        })
      }
    }
  }
}
