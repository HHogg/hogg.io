use std::collections::HashMap;

use serde::Serialize;
use typeshare::typeshare;

use crate::pattern_radial::PatternRadial;
use crate::r#match::Match;
use crate::{Patterns, Point, Polygon, TilingError, ValidationError};

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct VertexTypeStore {
  #[typeshare(serialized_as = "Vec<String>")]
  pub vertex_types: Patterns,
  #[serde(skip)]
  vertex_types_by_point: HashMap<Point, PatternRadial>,
  #[serde(skip)]
  possible_vertex_types: Patterns,
}

impl VertexTypeStore {
  ///
  pub fn add_polygon(&mut self, polygon: &mut Polygon) -> Result<(), TilingError> {
    let polygon_clone = polygon.clone();

    for point in polygon.points.iter_mut() {
      let vertex_type = self
        .vertex_types_by_point
        .entry(*point)
        .or_insert_with(|| PatternRadial::new(*point, None));

      vertex_type.add_polygon(&polygon_clone)?;

      match self.possible_vertex_types.get_match(&vertex_type.pattern) {
        Match::Exact(sequence) => {
          point.vertex_type = Some(self.vertex_types.insert_sequence(sequence) as u8);
        }
        Match::None => {
          return Err(
            ValidationError::PatternRadial {
              reason: "no matching arrangement".to_string(),
            }
            .into(),
          );
        }
        _ => {}
      }
    }

    Ok(())
  }

  pub fn validate(&self) -> Result<(), TilingError> {
    if self.vertex_types.is_empty() {
      return Err(
        ValidationError::PatternRadial {
          reason: "No vertex types found".into(),
        }
        .into(),
      );
    }

    Ok(())
  }
}

impl Default for VertexTypeStore {
  fn default() -> Self {
    Self {
      vertex_types: Patterns::default(),
      vertex_types_by_point: HashMap::new(),
      possible_vertex_types: Patterns::new(&[
        [3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0],
        [4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0],
        [6, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 3, 3, 3, 6, 0, 0, 0, 0, 0, 0, 0],
        [3, 3, 3, 4, 4, 0, 0, 0, 0, 0, 0, 0],
        [3, 3, 4, 3, 4, 0, 0, 0, 0, 0, 0, 0],
        [3, 3, 4, 12, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 4, 3, 12, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 3, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 6, 3, 6, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 4, 4, 6, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 4, 6, 4, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 12, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [4, 6, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [4, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ]),
    }
  }
}
