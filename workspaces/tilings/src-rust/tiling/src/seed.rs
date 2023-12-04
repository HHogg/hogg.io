use std::fmt::Display;
use std::str::FromStr;

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use crate::path::Direction;
use crate::{Offset, Shape, TilingError};

#[derive(Clone, Copy, Debug, Default, Deserialize, Eq, Hash, PartialEq, Serialize)]
#[typeshare]
pub struct Seed {
  pub shape: Shape,
  pub offset: Offset,
}

impl Seed {
  pub fn with_shape(self, shape: Shape) -> Self {
    Self { shape, ..self }
  }

  pub fn with_offset(self, offset: Offset) -> Self {
    Self { offset, ..self }
  }

  pub fn first(direction: Direction) -> Self {
    Self {
      shape: Shape::first(direction),
      offset: Offset::first(direction),
    }
  }

  pub fn previous(&self) -> Option<Self> {
    if let Some(previous_offset) = self.offset.previous() {
      return Some(Self {
        shape: self.shape,
        offset: previous_offset,
      });
    }

    if let Some(previous_shape) = self.shape.previous() {
      return Some(Self {
        shape: previous_shape,
        offset: Offset::first(Direction::FromEnd),
      });
    }

    None
  }

  pub fn next(&self) -> Option<Self> {
    if let Some(next_offset) = self.offset.next() {
      return Some(Self {
        shape: self.shape,
        offset: next_offset,
      });
    }

    if let Some(next_shape) = self.shape.next() {
      return Some(Self {
        shape: next_shape,
        offset: Offset::first(Direction::FromStart),
      });
    }

    None
  }
}

impl Display for Seed {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{}{}", self.shape, self.offset)
  }
}

impl FromStr for Seed {
  type Err = TilingError;

  fn from_str(mut s: &str) -> Result<Self, Self::Err> {
    let offset = Offset::from_str(&s[s.len() - 1..]);

    // If we got a valid offset, remove it from the string.
    if offset.is_ok() {
      s = &s[..s.len() - 1];
    }

    let shape = Shape::from_str(s)?;

    Ok(Self {
      shape,
      offset: offset.unwrap_or_default(),
    })
  }
}
