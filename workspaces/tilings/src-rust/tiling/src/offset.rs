use std::str::FromStr;

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use super::TilingError;
use crate::path::Direction;

#[derive(Clone, Copy, Debug, Deserialize, Eq, Hash, PartialEq, Serialize)]
#[typeshare]
pub enum Offset {
  Center,
}

impl Offset {
  pub fn first(direction: Direction) -> Self {
    match direction {
      Direction::FromStart => Self::Center,
      Direction::FromEnd => Self::Center,
    }
  }

  pub fn get_name(&self) -> String {
    match self {
      Self::Center => "Center".to_string(),
    }
  }

  pub fn previous(&self) -> Option<Self> {
    match self {
      Self::Center => None,
    }
  }

  pub fn next(&self) -> Option<Self> {
    match self {
      Self::Center => None,
    }
  }
}

impl Default for Offset {
  fn default() -> Self {
    Self::Center
  }
}

impl std::fmt::Display for Offset {
  fn fmt(&self, fmt: &mut std::fmt::Formatter) -> Result<(), std::fmt::Error> {
    write!(
      fmt,
      "{}",
      match *self {
        Self::Center => "",
      }
    )
  }
}

impl FromStr for Offset {
  type Err = TilingError;

  fn from_str(value: &str) -> Result<Self, Self::Err> {
    match value {
      "c" => Ok(Self::Center),
      _ => {
        Err(TilingError::InvalidOffset {
          offset: value.into(),
          reason: "invalid".into(),
        })
      }
    }
  }
}
