#[path = "./origin_index_tests.rs"]
#[cfg(test)]
mod tests;

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
  pub fn first(plane: &Option<&Plane>, origin_type: &OriginType, direction: &Direction) -> Self {
    match direction {
      Direction::FromStart => 0,
      Direction::FromEnd => {
        let point_count = plane
          .expect("Plane must be built with the path first, when calling OriginIndex::first with Direction::FromEnd")
          .get_point_count_by_type(origin_type);

        if point_count == 0 {
          panic!("Origin type has no points. The plane needs to be built with the path first, when calling OriginIndex::first with Direction::FromEnd");
        }

        point_count - 1
      },
    }
    .into()
  }

  pub fn previous_index(&self) -> Option<Self> {
    if self.value == 0 {
      None
    } else {
      Some(Self {
        value: self.value - 1,
      })
    }
  }

  pub fn next_index(&self, plane: &Plane, origin_type: &OriginType) -> Option<Self> {
    if plane.get_point_count_by_type(origin_type) == (self.value + 1) as usize {
      return None;
    }

    Some(Self {
      value: self.value + 1,
    })
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
      Ok(0) => Err(TilingError::InvalidOriginIndex {
        origin_index: value.into(),
        reason: "origin index must be greater than 0".into(),
      }),
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
