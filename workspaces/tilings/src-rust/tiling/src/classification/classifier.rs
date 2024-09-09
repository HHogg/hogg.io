use serde::Serialize;
use typeshare::typeshare;

use super::{EdgeTypeStore, ShapeTypeStore, VertexTypeStore};
use crate::geometry::{LineSegment, Polygon};
use crate::TilingError;

#[derive(Clone, Debug, Default, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Classifier {
  pub edge_type_store: EdgeTypeStore,
  pub shape_type_store: ShapeTypeStore,
  pub vertex_type_store: VertexTypeStore,
}

impl Classifier {
  pub fn get_unique_key(&self) -> String {
    let vertex_types = self.vertex_type_store.vertex_types.clone();
    let edge_types = self.edge_type_store.edge_types.clone();
    let shape_types = self.shape_type_store.shape_types.clone();

    format!(
      "V({}) + E({}) + S({})",
      vertex_types, edge_types, shape_types
    )
  }

  pub fn get_edges(&self) -> impl Iterator<Item = &LineSegment> {
    self.edge_type_store.get_edges()
  }

  pub fn add_polygon(&mut self, polygon: &mut Polygon) -> Result<(), TilingError> {
    self.vertex_type_store.add_polygon(polygon)?;
    self.edge_type_store.add_polygon(polygon)?;
    self
      .shape_type_store
      .add_polygon(polygon, &self.edge_type_store)?;
    Ok(())
  }

  pub fn annotate_polygon(&mut self, mut polygon: Polygon) -> Polygon {
    self.shape_type_store.annotate_polygon(&mut polygon);
    polygon
  }

  pub fn is_line_segment_available(&self, line_segment: &LineSegment) -> bool {
    self.edge_type_store.is_available(line_segment)
  }
}
