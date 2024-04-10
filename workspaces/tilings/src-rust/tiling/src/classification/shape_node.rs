use std::cmp::Ordering;

use circular_sequence::Sequence;
use serde::Serialize;

use crate::math::compare_radians;
use crate::{Point, Shape, TilingError};

const MAX_SIZE: usize = 12;

#[derive(Clone, Debug, Default, Serialize)]
pub struct GeoNode {
  pub links: [Option<ShapeLocation>; MAX_SIZE],
  pub point: Point,
  pub sequence: Sequence,
  pub size: Option<u8>,
}

impl GeoNode {
  pub fn with_point(self, point: Point) -> Self {
    Self { point, ..self }
  }

  pub fn with_size(self, size: Option<u8>) -> Self {
    Self { size, ..self }
  }

  pub fn len(&self) -> usize {
    circular_sequence::get_length(&self.sequence)
  }

  pub fn is_full(&self) -> bool {
    self.len() == self.size.unwrap_or(MAX_SIZE as u8) as usize
  }

  pub fn get(&self, index: usize) -> &Option<ShapeLocation> {
    if index >= MAX_SIZE {
      return &None;
    }

    &self.links[index]
  }

  pub fn connect(&mut self, node: ShapeLocation) -> Result<(), TilingError> {
    let size = self.size.unwrap_or(MAX_SIZE as u8) as usize;

    // Insert the shape into the next available slot.
    for index in 0..size {
      if self.links[index].is_none() {
        self.links[index] = Some(node);
        break;
      } else if index == size {
        return Err(
          TilingError::Application {
            reason: "too many entries in ShapeNode".to_string(),
          }
          .into(),
        );
      }
    }

    // The shapes need to be sorted to match
    // up with a valid combination.
    self.links.sort_by(|a, b| {
      match (a, b) {
        (Some(a), Some(b)) => {
          compare_radians(
            a.point.radian_to(&self.point),
            b.point.radian_to(&self.point),
          )
        }
        (Some(_), None) => Ordering::Less,
        (None, Some(_)) => Ordering::Greater,
        (None, None) => Ordering::Equal,
      }
    });

    // Update the sequence.
    self.sequence = Sequence::default();
    self.links.iter().for_each(|node| {
      if let Some(node) = node {
        circular_sequence::insert(&mut self.sequence, node.shape.into())
      }
    });

    Ok(())
  }
}

#[derive(Clone, Debug, Default, Serialize)]
pub struct ShapeLocation {
  pub point: Point,
  pub shape: Shape,
}

impl ShapeLocation {
  pub fn with_point(self, point: Point) -> Self {
    Self { point, ..self }
  }

  pub fn with_shape(self, shape: Shape) -> Self {
    Self { shape, ..self }
  }
}
