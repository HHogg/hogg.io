use std::fmt::Display;

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use super::{Direction, Operation, OriginIndex, OriginType};
use crate::build::Plane;

#[derive(Clone, Debug, Default, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct TransformEccentric {
  pub operation: Operation,
  pub origin_type: OriginType,
  pub origin_index: OriginIndex,
}

impl TransformEccentric {
  pub fn first(plane: &Option<&Plane>, direction: &Direction) -> Self {
    let mut transform = Self::default();
    transform.operation = Operation::first(direction);
    transform.origin_type = OriginType::first(direction);
    transform.origin_index = OriginIndex::first(plane, &transform.origin_type, direction);
    transform
  }

  pub fn previous(&self, plane: &Plane) -> Option<Self> {
    if let Some(previous_origin_index) = self.origin_index.previous_index() {
      return Some(Self {
        operation: self.operation,
        origin_type: self.origin_type,
        origin_index: previous_origin_index,
      });
    }

    if let Some(previous_origin_type) = self.origin_type.previous() {
      return Some(Self {
        operation: self.operation,
        origin_type: previous_origin_type,
        origin_index: OriginIndex::first(&Some(plane), &previous_origin_type, &Direction::FromEnd),
      });
    }

    if let Some(previous_operation) = self.operation.previous() {
      return Some(Self {
        operation: previous_operation,
        origin_type: OriginType::first(&Direction::FromEnd),
        origin_index: OriginIndex::first(
          &Some(plane),
          &OriginType::first(&Direction::FromEnd),
          &Direction::FromEnd,
        ),
      });
    }

    None
  }

  pub fn next(&self, plane: &Plane) -> Option<Self> {
    if let Some(next_origin_index) = self.origin_index.next_index(plane, &self.origin_type) {
      return Some(Self {
        operation: self.operation,
        origin_type: self.origin_type,
        origin_index: next_origin_index,
      });
    }

    if let Some(next_origin_type) = self.origin_type.next() {
      return Some(Self {
        operation: self.operation,
        origin_type: next_origin_type,
        origin_index: OriginIndex::first(&Some(plane), &next_origin_type, &Direction::FromStart),
      });
    }

    if let Some(next_operation) = self.operation.next() {
      return Some(Self {
        operation: next_operation,
        origin_type: OriginType::first(&Direction::FromStart),
        origin_index: OriginIndex::first(
          &Some(plane),
          &OriginType::first(&Direction::FromStart),
          &Direction::FromStart,
        ),
      });
    }

    None
  }
}

impl Display for TransformEccentric {
  fn fmt(&self, fmt: &mut std::fmt::Formatter) -> Result<(), std::fmt::Error> {
    write!(
      fmt,
      "{}({}{})",
      self.operation, self.origin_type, self.origin_index,
    )
  }
}
