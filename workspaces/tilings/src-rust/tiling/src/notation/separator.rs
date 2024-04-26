use std::fmt::Display;

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use super::Direction;

#[derive(Clone, Copy, Debug, Deserialize, Eq, Hash, PartialEq, Serialize)]
#[typeshare]
pub enum Separator {
  Group,
  Shape,
  Transform,
}

impl Separator {
  pub fn first(direction: Direction) -> Self {
    match direction {
      Direction::FromStart => Self::Group,
      Direction::FromEnd => Self::Shape,
    }
  }

  pub fn previous(&self) -> Option<Self> {
    match self {
      Separator::Group => None,
      Separator::Shape => Some(Separator::Group),
      Separator::Transform => None,
    }
  }

  pub fn next(&self) -> Option<Self> {
    match self {
      Separator::Group => Some(Separator::Shape),
      Separator::Shape => None,
      Separator::Transform => None,
    }
  }
}

impl Default for Separator {
  fn default() -> Self {
    Self::Group
  }
}

impl Display for Separator {
  fn fmt(&self, fmt: &mut std::fmt::Formatter) -> Result<(), std::fmt::Error> {
    write!(
      fmt,
      "{}",
      match *self {
        Self::Group => "-",
        Self::Shape => ",",
        Self::Transform => "/",
      }
    )
  }
}
