use std::cmp::Ordering;

use serde::Serialize;

use crate::math::compare_radians;
use crate::pattern::Pattern;
use crate::{Point, Polygon, TilingError, ValidationError};

#[derive(Clone, Debug, Serialize)]
pub struct PatternRadial {
  pub pattern: Pattern,

  locations: [Location; 12],
  point: Point,
  size: Option<u8>,
}

impl PatternRadial {
  pub fn new(point: Point, size: Option<u8>) -> Self {
    Self {
      point,
      size,
      pattern: Pattern::default(),
      locations: Default::default(),
    }
  }

  pub fn len(&self) -> usize {
    self.pattern.len()
  }

  pub fn size(&self) -> u8 {
    self.size.unwrap_or(0)
  }

  pub fn iter(&self) -> impl Iterator<Item = &Location> {
    self.locations.iter().filter(|l| l.shape != 0)
  }

  pub fn is_full(&self) -> bool {
    self.size.map(|s| self.len() == s as usize).unwrap_or(false)
  }

  pub fn get_location_pair(&self, point: &Point) -> (Option<&Location>, Option<&Location>) {
    let a = self.iter().find(|l| l.point == *point);
    let b = self.iter().find(|l| l.point != *point);

    (a, b)
  }

  pub fn add_polygon(&mut self, polygon: &Polygon) -> Result<(), TilingError> {
    self.insert_location(Location::for_polygon_from_point(polygon, &self.point))?;
    Ok(())
  }

  pub fn insert_location(&mut self, location: Location) -> Result<(), TilingError> {
    let size = self.size.unwrap_or(self.locations.len() as u8) as usize;

    // Insert the shape into the next available slot.
    for index in 0..size {
      if self.locations[index].shape == 0 {
        self.locations[index] = location;
        break;
      } else if index == size {
        return Err(
          ValidationError::PatternRadial {
            reason: "too many entries in PatternRadial".to_string(),
          }
          .into(),
        );
      }
    }

    // The shapes need to be sorted to match
    // up with a valid combination.
    self.locations.sort_by(|a, b| {
      if b.shape == 0 {
        return Ordering::Less;
      } else if a.shape == 0 {
        return Ordering::Greater;
      }

      compare_radians(a.radian, b.radian)
    });

    self.pattern = self.locations.iter().map(|l| l.shape).collect();

    Ok(())
  }
}

///
#[derive(Clone, Copy, Debug, Default, Serialize)]
pub struct Location {
  pub point: Point,
  pub shape: u8,

  radian: f64,
}

impl Location {
  pub fn for_polygon_from_point(polygon: &Polygon, point: &Point) -> Self {
    Self {
      point: polygon.centroid,
      shape: polygon.shape.to_u8(),
      radian: polygon.centroid.radian_to(point),
    }
  }
}
