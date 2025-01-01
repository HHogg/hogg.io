#[path = "./transform_value_tests.rs"]
#[cfg(test)]
mod tests;

use std::fmt::Display;

use serde::{Deserialize, Serialize};
use spatial_grid_map::utils::degrees_to_radian;
use typeshare::typeshare;

use super::{Direction, Offset, Operation, Seed, Shape};
use crate::TilingError;

#[derive(Clone, Debug, Default, Deserialize, PartialEq, Eq, Serialize)]
#[typeshare]
pub struct TransformValue {
  pub increment: u16,
  pub operation: Operation,
  pub seed: Seed,
  pub value: u16,
}

impl TransformValue {
  pub fn first(operation: Operation, seed: Seed, direction: &Direction) -> Self {
    let mut transform_value = Self::default().with_operation(operation).with_seed(seed);

    transform_value.value = match direction {
      Direction::FromStart => transform_value.increment,
      Direction::FromEnd => transform_value.get_last_increment(),
    };

    transform_value
  }

  pub fn with_operation(mut self, operation: Operation) -> Self {
    self.operation = operation;
    self.update_increment();
    self
  }

  pub fn with_seed(mut self, seed: Seed) -> Self {
    self.seed = seed;
    self.update_increment();
    self
  }

  pub fn from_string(mut self, value: &str) -> Result<Self, TilingError> {
    match value.parse::<u16>() {
      Ok(parsed_value) => {
        self.validate(parsed_value)?;
        self.value = parsed_value;
      }
      Err(_) => {
        Err(TilingError::InvalidTransformValue {
          value: value.into(),
          reason: "failed to parse".into(),
        })?;
      }
    }

    Ok(self)
  }

  pub fn as_radian(&self) -> f64 {
    degrees_to_radian(self.value)
  }

  pub fn get_last_increment(&self) -> u16 {
    let mut value = self.increment;

    while value + self.increment < 180 {
      value += self.increment;
    }

    value
  }

  pub fn get_transform_values(&self) -> Vec<f64> {
    let mut value = self.value;
    let mut values = vec![];

    while value < 360 {
      values.push(degrees_to_radian(value));
      value *= 2;
    }

    values
  }

  pub fn validate(&self, value: u16) -> Result<(), TilingError> {
    let mut i = self.increment;

    while i <= 180 {
      if value == i {
        return Ok(());
      }

      i += self.increment;
    }

    Err(TilingError::InvalidTransformValue {
      value: value.to_string(),
      reason: format!(
        "must be a multiple of {} and less than or equal to 180",
        self.increment
      ),
    })
  }

  pub fn previous_value(&mut self) -> Option<Self> {
    if self.value - self.increment < self.increment {
      return None;
    }

    self.value -= self.increment;
    Some(self.clone())
  }

  pub fn next_value(&mut self) -> Option<Self> {
    if self.value + self.increment >= 180 {
      return None;
    }

    self.value += self.increment;
    Some(self.clone())
  }

  fn update_increment(&mut self) {
    self.increment = match (self.operation, self.seed.offset, self.seed.shape) {
      (Operation::Reflect, Offset::Center, Shape::Triangle) => 30,
      (Operation::Reflect, Offset::Center, Shape::Square) => 45,
      (Operation::Reflect, Offset::Center, Shape::Hexagon) => 30,
      (Operation::Reflect, Offset::Center, Shape::Octagon) => 45,
      (Operation::Reflect, Offset::Center, Shape::Dodecagon) => 15,

      (Operation::Rotate, Offset::Center, Shape::Triangle) => 60,
      (Operation::Rotate, Offset::Center, Shape::Square) => 90,
      (Operation::Rotate, Offset::Center, Shape::Hexagon) => 60,
      (Operation::Rotate, Offset::Center, Shape::Octagon) => 45,
      (Operation::Rotate, Offset::Center, Shape::Dodecagon) => 30,
      _ => 0,
    };

    self.value = self.increment;
  }
}

impl Display for TransformValue {
  fn fmt(&self, fmt: &mut std::fmt::Formatter) -> Result<(), std::fmt::Error> {
    write!(fmt, "{}", self.value)
  }
}
