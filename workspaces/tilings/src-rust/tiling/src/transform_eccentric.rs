use std::fmt::Display;

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use super::{Operation, OriginIndex, OriginType};
use crate::path::Direction;
use crate::Polygons;

#[derive(Clone, Debug, Default, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct TransformEccentric {
  pub operation: Operation,
  pub origin_type: OriginType,
  pub origin_index: OriginIndex,
}

impl TransformEccentric {
  pub fn first(polygons: &Polygons, direction: &Direction) -> Self {
    let mut transform = Self::default();
    transform.operation = Operation::first(direction);
    transform.origin_type = OriginType::first(direction);
    transform.origin_index = OriginIndex::first(polygons, &transform.origin_type, direction);
    transform
  }

  pub fn previous(&mut self, polygons: &Polygons) -> Option<Self> {
    if let Some(previous_origin_index) = self.origin_index.previous_index() {
      if polygons
        .get_point_by_index_and_type(&self.origin_type, &previous_origin_index)
        .is_some()
      {
        self.origin_index = previous_origin_index;
        return Some(self.clone());
      }
    }

    if let Some(previous_origin_type) = self.origin_type.previous() {
      self.origin_type = previous_origin_type;
      self.origin_index = polygons.get_point_count_by_type(&self.origin_type).into();
      return Some(self.clone());
    }

    if let Some(previous_operation) = self.operation.previous() {
      self.operation = previous_operation;
      self.origin_type = OriginType::first(&Direction::FromEnd);
      self.origin_index = polygons.get_point_count_by_type(&self.origin_type).into();
      return Some(self.clone());
    }

    None
  }

  pub fn next(&mut self, polygons: &Polygons) -> Option<Self> {
    let next_origin_index = self.origin_index.next_index();

    if polygons
      .get_point_by_index_and_type(&self.origin_type, &next_origin_index)
      .is_some()
    {
      self.origin_index = next_origin_index;
      return Some(self.clone());
    }

    if let Some(next_origin_type) = self.origin_type.next() {
      self.origin_type = next_origin_type;
      self.origin_index = OriginIndex::first(polygons, &self.origin_type, &Direction::FromStart);
      return Some(self.clone());
    }

    if let Some(next_operation) = self.operation.next() {
      self.operation = next_operation;
      self.origin_type = OriginType::first(&Direction::FromStart);
      self.origin_index = OriginIndex::first(polygons, &self.origin_type, &Direction::FromStart);
      return Some(self.clone());
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
