use std::collections::HashMap;

use circular_sequence::{Match, SequenceStore};
use serde::Serialize;
use typeshare::typeshare;

use super::shape_node::ShapeLocation;
use crate::classification::{EdgeTypeStore, GeoNode};
use crate::{Point, Polygon, TilingError};

#[derive(Clone, Debug, Default, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct ShapeTypeStore {
  #[typeshare(serialized_as = "Vec<String>")]
  pub shape_types: SequenceStore,
  #[serde(skip)]
  shape_types_by_point: HashMap<Point, GeoNode>,
}

impl ShapeTypeStore {
  ///
  pub fn annotate_polygon(&mut self, polygon: &mut Polygon) {
    if let Some(node) = self.shape_types_by_point.get(&polygon.centroid) {
      if node.is_full() {
        match self.shape_types.get_match(&node.sequence) {
          Match::Exact(index) => {
            polygon.shape_type = Some(index);
          }
          _ => {
            polygon.shape_type = Some(self.shape_types.insert(node.sequence));
          }
        }
      }
    }
  }

  /// Takes a polygon that has just been added to start recording which
  /// other shapes are connected to it. It does this by first recording
  /// itself inside the shape_type_by_point (where the point is the polygon
  /// centroid). Then, for each of the line segments in the polygon, it
  /// looks up the edge type in the edge_type_store. This will at minimum
  /// have 1 location, the current polygon and at most 2 locations, the
  /// other polygon too which tells us the polygon has already been added
  /// and we can update the shape type to include the other polygon, and
  /// the other polygons shape type to include this polygon.
  pub fn add_polygon(
    &mut self,
    polygon: &Polygon,
    edge_type_store: &EdgeTypeStore,
  ) -> Result<(), TilingError> {
    for line_segment in polygon.line_segments.iter() {
      let edge_type = edge_type_store
        .get(line_segment)
        .ok_or(TilingError::Application {
          reason: "Edge not available in EdgeTypeStore".into(),
        })?;

      if let (Some(node_a), Some(node_b)) = (edge_type.get(0), edge_type.get(1)) {
        self.update_shape_type(node_a, node_b)?;
        self.update_shape_type(node_b, node_a)?;
      }
    }

    Ok(())
  }

  fn update_shape_type(
    &mut self,
    node_a: &ShapeLocation,
    node_b: &ShapeLocation,
  ) -> Result<(), TilingError> {
    let shape_type = self
      .shape_types_by_point
      .entry(node_a.point)
      .or_insert_with(|| {
        GeoNode::default()
          .with_point(node_a.point)
          .with_size(Some(node_a.shape.into()))
      });

    shape_type.connect(node_b.clone())?;

    if shape_type.is_full() {
      self.shape_types.insert(shape_type.sequence);
    }

    Ok(())
  }
}
