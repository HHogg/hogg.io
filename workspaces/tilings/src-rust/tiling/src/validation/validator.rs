use super::{Error, Flag};
use crate::{
  build::Plane,
  geometry::{LineSegment, Polygon},
};

#[derive(Clone, Debug, Default)]
pub struct Validator {
  option_validate_expansion: bool,
  option_validate_gaps: bool,
  option_validate_overlap: bool,
  option_validate_vertex_types: bool,
  option_validate_edge_types: bool,
  option_validate_shape_types: bool,
}

impl Validator {
  /// Returns whether or not the validator is set to
  /// validate vertex types.
  pub fn is_validating_vertex_types(&self) -> bool {
    self.option_validate_vertex_types
  }

  /// Returns whether or not the validator is set to
  /// validate edge types.
  pub fn is_validating_edge_types(&self) -> bool {
    self.option_validate_edge_types
  }

  /// Returns whether or not the validator is set to
  /// validate shape types.
  pub fn is_validating_shape_types(&self) -> bool {
    self.option_validate_shape_types
  }

  ///
  /// Time: O(n)
  /// Space: O(1)
  pub fn validate_overlaps(
    &self,
    plane: &Plane,
    polygon: &Polygon,
    line_segment: &LineSegment,
  ) -> Result<(), Error> {
    if !self.option_validate_overlap {
      return Ok(());
    }

    // If a line segment has more than 2 polygons touching it
    // then it's overlapping with another line segment
    if plane
      .line_segments
      .get_counter(&line_segment.mid_point().into(), "count")
      .map_or(false, |count| *count > 2)
    {
      return Err(Error::Overlaps {});
    }

    let nearby_line_segments = plane
      .line_segments
      .iter_values_around(&line_segment.mid_point().into(), 1)
      .expect("line segment mid point exists outside the grid")
      .filter(|other| *other != line_segment);

    // If a line segment intersects with another line segment
    // then it's overlapping with another line segment
    for nearby_line_segment in nearby_line_segments {
      if line_segment.intersects(nearby_line_segment) {
        return Err(Error::Overlaps {});
      }
    }

    let nearby_polygons = plane
      .polygons
      .iter_values_around(&polygon.centroid.into(), 1)
      .expect("polygon centroid exists outside the grid")
      .filter(|other| *other != polygon);

    // If the distance between the centroids of 2 polygons is
    // greater than the sum of their apothems then they are not
    // overlapping.
    for nearby_polygon in nearby_polygons {
      if polygon.intersects(nearby_polygon) {
        return Err(Error::Overlaps {});
      }
    }

    Ok(())
  }

  /// Checks that the tiling expanded by ensuring all of edges
  /// of the polygons placed in the placement phase now have
  /// shapes attached to them
  ///
  /// Time: O(n)
  /// Space: O(1)
  pub fn validate_expanded(&self, plane: &Plane) -> Result<(), Error> {
    if !self.option_validate_expansion {
      return Ok(());
    }

    for line_segment_group in &plane.line_segments_by_shape_group {
      for line_segment in line_segment_group {
        if plane.is_line_segment_available(line_segment) {
          return Err(Error::Expansion);
        }
      }
    }

    Ok(())
  }

  /// Time: O(n)
  /// Space: O(n)
  pub fn validate_gaps(&self, plane: &Plane) -> Result<(), Error> {
    if !self.option_validate_gaps {
      return Ok(());
    }

    let line_segments = plane.get_line_segment_edges();
    let mut line_segments_deque = line_segments.clone();
    let mut line_segments_iter = line_segments.iter_values();
    let first_line_segment = line_segments_iter.next();

    if first_line_segment.is_none() {
      return Ok(());
    }

    let first_line_segment = first_line_segment.expect("First line segment does not exist");
    let mut current_line_segment = first_line_segment;

    loop {
      let mid_point: (f64, f64) = current_line_segment.mid_point().into();
      let near_by = line_segments.iter_values_around(&mid_point, 3);

      if let Some(near_by) = near_by {
        let mut found = false;

        for other in near_by {
          if line_segments_deque.contains(&other.mid_point().into()) {
            if current_line_segment.is_connected(other) {
              line_segments_deque.remove(&mid_point);
              current_line_segment = other;
              found = true;
              break;
            } else {
              // Line segment not connected
            }
          } else {
            // Line segment already removed
          }
        }

        // If we didn't find a connected line segment then there are gaps
        if !found {
          return Err(Error::Gaps);
        }
      } else {
        // If we didn't find any line segments around the mid point
        return Err(Error::Gaps);
      }

      // If we've reached the first line segment then we've
      // completed connecting the border of the starting line segment
      if current_line_segment.is_connected(first_line_segment) {
        line_segments_deque.remove(&current_line_segment.mid_point().into());
        break;
      }
    }

    // We need to check if there are any line segments left over
    // that are not connected to the border, if there are
    // then there are gaps in the tessellation
    if line_segments_deque.is_empty() {
      Ok(())
    } else {
      Err(Error::Gaps)
    }
  }

  pub fn validate_vertex_types(&self, _polygons: &Plane) -> Result<(), Error> {
    if !self.option_validate_vertex_types {
      return Ok(());
    }

    Ok(())
  }

  pub fn validate_edge_types(&self, _polygons: &Plane) -> Result<(), Error> {
    if !self.option_validate_edge_types {
      return Ok(());
    }

    Ok(())
  }

  pub fn validate_shape_types(&self, _polygons: &Plane) -> Result<(), Error> {
    if !self.option_validate_shape_types {
      return Ok(());
    }

    Ok(())
  }
}

impl From<Option<Vec<Flag>>> for Validator {
  fn from(flags: Option<Vec<Flag>>) -> Self {
    let mut option_validate_expansion = false;
    let mut option_validate_gaps = false;
    let mut option_validate_overlap = false;
    let mut option_validate_vertex_types = false;
    let mut option_validate_edge_types = false;
    let mut option_validate_shape_types = false;

    if let Some(flags) = flags {
      for flag in flags {
        match flag {
          Flag::Expanded => option_validate_expansion = true,
          Flag::Gaps => option_validate_gaps = true,
          Flag::Overlaps => option_validate_overlap = true,
          Flag::VertexTypes => option_validate_vertex_types = true,
          Flag::EdgeTypes => option_validate_edge_types = true,
          Flag::ShapeTypes => option_validate_shape_types = true,
        }
      }
    }

    Self {
      option_validate_expansion,
      option_validate_gaps,
      option_validate_overlap,
      option_validate_vertex_types,
      option_validate_edge_types,
      option_validate_shape_types,
    }
  }
}
