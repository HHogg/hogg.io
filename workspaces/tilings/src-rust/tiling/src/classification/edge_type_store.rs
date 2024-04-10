use std::collections::HashMap;

use circular_sequence::SequenceStore;
use serde::Serialize;
use typeshare::typeshare;

use super::shape_node::ShapeLocation;
use crate::classification::GeoNode;
use crate::{LineSegment, Polygon, TilingError};

#[derive(Clone, Debug, Default, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct EdgeTypeStore {
  #[typeshare(serialized_as = "Vec<String>")]
  pub edge_types: SequenceStore,
  #[serde(skip)]
  edge_types_by_line_segment: HashMap<LineSegment, GeoNode>,
}

impl EdgeTypeStore {
  pub fn get(&self, line_segment: &LineSegment) -> Option<&GeoNode> {
    match (
      self.edge_types_by_line_segment.get(line_segment),
      self.edge_types_by_line_segment.get(&line_segment.flip()),
    ) {
      (Some(node), _) => Some(node),
      (_, Some(node)) => Some(node),
      (_, _) => None,
    }
  }

  /// Returns the number of times a line segment has been used
  /// by a polygon.
  pub fn get_mut(&mut self, line_segment: &LineSegment) -> Option<&mut GeoNode> {
    if self.edge_types_by_line_segment.get(line_segment).is_some() {
      return self.edge_types_by_line_segment.get_mut(line_segment);
    }

    let flipped_line_segment = line_segment.flip();

    if self
      .edge_types_by_line_segment
      .get(&flipped_line_segment)
      .is_some()
    {
      return self
        .edge_types_by_line_segment
        .get_mut(&flipped_line_segment);
    }

    self.edge_types_by_line_segment.insert(
      *line_segment,
      GeoNode::default()
        .with_point(line_segment.mid_point())
        .with_size(Some(2)),
    );

    self.edge_types_by_line_segment.get_mut(line_segment)
  }

  /// Returns the number of times a line segment has been used
  /// by a polygon.
  pub fn get_count(&self, line_segment: &LineSegment) -> usize {
    self.get(line_segment).map_or(0, |node| node.len())
  }

  /// Returns all of the line segments that only have a single
  /// shape touching it. These are the line segments that are
  /// on the edge of the tiling or the edge of a hole in the tiling.
  pub fn get_edges(&self) -> impl Iterator<Item = &LineSegment> {
    self
      .edge_types_by_line_segment
      .iter()
      .filter_map(|(line_segment, node)| {
        if node.len() == 1 {
          Some(line_segment)
        } else {
          None
        }
      })
  }

  /// Returns true if a line segment has only been used once
  pub fn is_available(&self, line_segment: &LineSegment) -> bool {
    self.get_count(line_segment) <= 1
  }

  ///
  pub fn add_polygon(&mut self, polygon: &Polygon) -> Result<(), TilingError> {
    for line_segment in polygon.line_segments.iter() {
      if let Some(node) = self.get_mut(line_segment) {
        node.connect(
          ShapeLocation::default()
            .with_point(polygon.centroid)
            .with_shape(polygon.shape),
        )?;
      }

      if let Some(node) = self.get(line_segment) {
        if node.is_full() {
          self.edge_types.insert(node.sequence);
        }
      }
    }

    Ok(())
  }
}
