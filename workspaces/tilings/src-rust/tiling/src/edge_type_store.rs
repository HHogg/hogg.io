use std::collections::HashMap;

use serde::Serialize;
use typeshare::typeshare;

use crate::pattern_radial::PatternRadial;
use crate::{LineSegment, Polygon, TilingError};

#[derive(Clone, Debug, Default, Serialize)]
#[typeshare]
pub struct EdgeTypeStore {
  #[serde(skip)]
  edge_types_by_line_segment: HashMap<LineSegment, PatternRadial>,
}

impl EdgeTypeStore {
  /// Returns the pattern for a line segment (the shapes that are around it)
  pub fn get(&self, line_segment: &LineSegment) -> Option<&PatternRadial> {
    match (
      self.edge_types_by_line_segment.get(line_segment),
      self.edge_types_by_line_segment.get(&line_segment.flip()),
    ) {
      (Some(pattern), _) => Some(pattern),
      (_, Some(pattern)) => Some(pattern),
      (_, _) => None,
    }
  }

  /// Returns the number of times a line segment has been used
  /// by a polygon.
  pub fn get_mut(&mut self, line_segment: &LineSegment) -> Option<&mut PatternRadial> {
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
      line_segment.clone(),
      PatternRadial::new(line_segment.mid_point(), Some(2)),
    );

    self.edge_types_by_line_segment.get_mut(line_segment)
  }

  /// Returns the number of times a line segment has been used
  /// by a polygon.
  pub fn get_count(&self, line_segment: &LineSegment) -> usize {
    self.get(line_segment).map_or(0, |pattern| pattern.len())
  }

  /// Returns all of the line segments that only have a single
  /// shape touching it. These are the line segments that are
  /// on the edge of the tiling or the edge of a hole in the tiling.
  pub fn get_edges(&self) -> impl Iterator<Item = &LineSegment> {
    self
      .edge_types_by_line_segment
      .iter()
      .filter_map(|(line_segment, pattern)| {
        if pattern.len() == 1 {
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
  pub fn add_polygon(&mut self, polygon: &mut Polygon) {
    for line_segment in polygon.line_segments.iter() {
      self
        .get_mut(line_segment)
        .map(|pattern| pattern.add_polygon(&polygon));
    }
  }

  pub fn validate(&self) -> Result<(), TilingError> {
    Ok(())
  }
}
