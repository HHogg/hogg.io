#[path = "./shape_tests.rs"]
#[cfg(test)]
mod tests;

use std::str::FromStr;

use hogg_spatial_grid_map::{Fxx, PI};
use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use super::Direction;
use crate::TilingError;

#[derive(Clone, Copy, Debug, Deserialize, Eq, Hash, PartialEq, PartialOrd, Ord, Serialize)]
#[typeshare]
pub enum Shape {
  Skip = 0,
  Triangle = 3,
  Square = 4,
  Hexagon = 6,
  Octagon = 8,
  Dodecagon = 12,
}

impl Shape {
  pub fn first(direction: Direction) -> Self {
    match direction {
      Direction::FromStart => Self::Triangle,
      Direction::FromEnd => Self::Skip,
    }
  }

  // TODO: Remove
  pub fn as_vec() -> [Self; 6] {
    [
      Self::Triangle,
      Self::Square,
      Self::Hexagon,
      Self::Octagon,
      Self::Dodecagon,
      Self::Skip,
    ]
  }

  pub fn get_name(&self) -> String {
    match self {
      Self::Skip => "Skip".to_string(),
      Self::Triangle => "Triangle".to_string(),
      Self::Square => "Square".to_string(),
      Self::Hexagon => "Hexagon".to_string(),
      Self::Octagon => "Octagon".to_string(),
      Self::Dodecagon => "Dodecagon".to_string(),
    }
  }

  pub fn get_internal_angle(&self) -> Fxx {
    (PI * 2.0) / *self as u8 as Fxx
  }

  pub fn get_side_length(&self) -> Fxx {
    2.0 * (PI / *self as u8 as Fxx).sin()
  }

  pub fn previous(&self) -> Option<Self> {
    match self {
      Self::Triangle => None,
      Self::Square => Some(Self::Triangle),
      Self::Hexagon => Some(Self::Square),
      Self::Octagon => Some(Self::Hexagon),
      Self::Dodecagon => Some(Self::Octagon),
      Self::Skip => Some(Self::Dodecagon),
    }
  }

  pub fn next(&self) -> Option<Self> {
    match self {
      Self::Triangle => Some(Self::Square),
      Self::Square => Some(Self::Hexagon),
      Self::Hexagon => Some(Self::Octagon),
      Self::Octagon => Some(Self::Dodecagon),
      Self::Dodecagon => Some(Self::Skip),
      Self::Skip => None,
    }
  }
}

impl Default for Shape {
  fn default() -> Self {
    Self::Triangle
  }
}

impl std::fmt::Display for Shape {
  fn fmt(&self, fmt: &mut std::fmt::Formatter) -> Result<(), std::fmt::Error> {
    write!(
      fmt,
      "{}",
      match *self {
        Self::Skip => "0",
        Self::Triangle => "3",
        Self::Square => "4",
        Self::Hexagon => "6",
        Self::Octagon => "8",
        Self::Dodecagon => "12",
      }
    )
  }
}

impl FromStr for Shape {
  type Err = TilingError;

  fn from_str(value: &str) -> Result<Self, Self::Err> {
    match value {
      "0" => Ok(Self::Skip),
      "3" => Ok(Self::Triangle),
      "4" => Ok(Self::Square),
      "6" => Ok(Self::Hexagon),
      "8" => Ok(Self::Octagon),
      "12" => Ok(Self::Dodecagon),
      "Triangle" => Ok(Self::Triangle),
      "Square" => Ok(Self::Square),
      "Hexagon" => Ok(Self::Hexagon),
      "Octagon" => Ok(Self::Octagon),
      "Dodecagon" => Ok(Self::Dodecagon),
      "Skip" => Ok(Self::Skip),
      _ => Err(TilingError::InvalidShape {
        shape: value.into(),
        reason: "invalid".into(),
      }),
    }
  }
}

impl From<Shape> for u8 {
  fn from(shape: Shape) -> u8 {
    shape as u8
  }
}
