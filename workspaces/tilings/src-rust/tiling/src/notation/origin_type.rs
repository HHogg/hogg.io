#[path = "./origin_type_tests.rs"]
#[cfg(test)]
mod tests;

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use super::Direction;
use crate::TilingError;

#[derive(Clone, Copy, Debug, Deserialize, Eq, Hash, PartialEq, Serialize)]
#[typeshare]
pub enum OriginType {
  CenterPoint,
  MidPoint,
  EndPoint,
}

impl OriginType {
  pub fn first(direction: &Direction) -> Self {
    match direction {
      Direction::FromStart => Self::CenterPoint,
      Direction::FromEnd => Self::EndPoint,
    }
  }

  pub fn previous(&self) -> Option<Self> {
    match *self {
      Self::CenterPoint => None,
      Self::MidPoint => Some(Self::CenterPoint),
      Self::EndPoint => Some(Self::MidPoint),
    }
  }

  pub fn next(&self) -> Option<Self> {
    match *self {
      Self::CenterPoint => Some(Self::MidPoint),
      Self::MidPoint => Some(Self::EndPoint),
      Self::EndPoint => None,
    }
  }
}

impl Default for OriginType {
  fn default() -> Self {
    Self::CenterPoint
  }
}

impl std::str::FromStr for OriginType {
  type Err = TilingError;

  fn from_str(value: &str) -> Result<Self, Self::Err> {
    match value {
      "c" => Ok(Self::CenterPoint),
      "h" => Ok(Self::MidPoint),
      "v" => Ok(Self::EndPoint),
      _ => {
        Err(TilingError::InvalidOriginType {
          origin_type: value.to_string(),
          reason: "failed to parse".into(),
        })
      }
    }
  }
}

impl std::fmt::Display for OriginType {
  fn fmt(&self, fmt: &mut std::fmt::Formatter) -> Result<(), std::fmt::Error> {
    write!(
      fmt,
      "{}",
      match *self {
        Self::CenterPoint => "c",
        Self::MidPoint => "h",
        Self::EndPoint => "v",
      }
    )
  }
}
