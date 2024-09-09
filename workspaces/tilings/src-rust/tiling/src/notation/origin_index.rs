use std::fmt::Display;
use std::str::FromStr;

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use super::{Direction, OriginType};
use crate::build::Plane;
use crate::TilingError;

#[derive(Clone, Copy, Debug, Default, Deserialize, Hash, PartialEq, Eq, Serialize)]
#[typeshare]
pub struct OriginIndex {
  pub value: u32,
}

impl OriginIndex {
  pub fn first(polygons: &Plane, origin_type: &OriginType, direction: &Direction) -> Self {
    match direction {
      Direction::FromStart => 0,
      Direction::FromEnd => polygons.get_point_count_by_type(origin_type) - 1,
    }
    .into()
  }

  pub fn previous_index(&mut self) -> Option<Self> {
    if self.value == 0 {
      None
    } else {
      self.value -= 1;
      Some(*self)
    }
  }

  pub fn next_index(&mut self) -> Self {
    self.value += 1;
    *self
  }
}

impl Display for OriginIndex {
  fn fmt(&self, fmt: &mut std::fmt::Formatter) -> Result<(), std::fmt::Error> {
    write!(fmt, "{}", (self.value + 1))
  }
}

impl FromStr for OriginIndex {
  type Err = TilingError;

  fn from_str(value: &str) -> Result<Self, Self::Err> {
    match value.parse::<usize>() {
      Ok(n) => Ok(Self::from(n - 1)),
      Err(_) => Err(TilingError::InvalidOriginIndex {
        origin_index: value.into(),
        reason: "failed to parse".into(),
      }),
    }
  }
}

impl From<usize> for OriginIndex {
  fn from(value: usize) -> Self {
    Self {
      value: value as u32,
    }
  }
}
