use std::collections::HashMap;

use circular_sequence::{Match, SequenceStore};
use serde::Serialize;
use typeshare::typeshare;

use super::shape_node::ShapeLocation;
use crate::classification::GeoNode;
use crate::geometry::{Point, Polygon};
use crate::TilingError;

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct VertexTypeStore {
  #[typeshare(serialized_as = "Vec<String>")]
  pub vertex_types: SequenceStore,
  #[serde(skip)]
  valid_vertex_types: SequenceStore,
  #[serde(skip)]
  vertex_types_by_point: HashMap<Point, GeoNode>,
}

impl VertexTypeStore {
  pub fn add_polygon(&mut self, polygon: &mut Polygon) -> Result<(), TilingError> {
    for point in polygon.points.iter_mut() {
      let node = self
        .vertex_types_by_point
        .entry(*point)
        .or_insert_with(|| GeoNode::default().with_point(*point));

      node.connect(
        ShapeLocation::default()
          .with_point(polygon.centroid)
          .with_shape(polygon.shape),
      )?;

      match self.valid_vertex_types.get_match(&node.sequence) {
        Match::Exact(index) => {
          if let Some(vertex_type) = self.valid_vertex_types.get(index) {
            let inserted_index = self.vertex_types.insert(*vertex_type);
            point.vertex_type = Some(inserted_index);
          }
        }
        Match::None => {
          return Err(TilingError::InvalidVertexType {
            value: format!("{:?}", node.sequence),
          });
        }
        _ => {}
      }
    }

    Ok(())
  }
}

impl Default for VertexTypeStore {
  fn default() -> Self {
    Self {
      vertex_types: SequenceStore::default(),
      vertex_types_by_point: HashMap::new(),
      valid_vertex_types: SequenceStore::from(vec![
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
