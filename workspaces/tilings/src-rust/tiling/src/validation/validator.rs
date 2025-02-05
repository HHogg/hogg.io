use hogg_gap_validation::has_single_circuit;
use hogg_geometry::LineSegment;

use super::{Error, Flag};
use crate::build::{Plane, Tile};

#[derive(Clone, Debug, Default)]
pub struct Validator {
  option_validate_expansion: bool,
  option_validate_gaps: bool,
  option_validate_overlap: bool,
  option_validate_vertex_types: bool,
}

impl Validator {
  /// Returns whether or not the validator is set to
  /// validate vertex types.
  pub fn is_validating_vertex_types(&self) -> bool {
    self.option_validate_vertex_types
  }

  pub fn validate_overlaps(
    &self,
    plane: &Plane,
    polygon: &Tile,
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
      .filter(|other| *other != line_segment);

    // If a line segment intersects with another line segment
    // then it's overlapping with another line segment
    for nearby_line_segment in nearby_line_segments {
      if line_segment.is_intersecting_with_polygon_line_segment(nearby_line_segment) {
        return Err(Error::Overlaps {});
      }
    }

    let nearby_polygons = plane
      .tiles
      .iter_values_around(&polygon.geometry.centroid.into(), 1)
      .filter(|other| *other != polygon);

    // If the distance between the centroids of 2 polygons is
    // greater than the sum of their apothems then they are not
    // overlapping.
    for nearby_polygon in nearby_polygons {
      if polygon.geometry.intersects(&nearby_polygon.geometry) {
        return Err(Error::Overlaps {});
      }
    }

    Ok(())
  }

  /// Checks that the tiling expanded by ensuring all of edges
  /// of the polygons placed in the placement phase now have
  /// shapes attached to them
  pub fn validate_expanded(&self, plane: &Plane) -> Result<(), Error> {
    if !self.option_validate_expansion {
      return Ok(());
    }

    for line_segment_group in &plane.line_segments_by_shape_group {
      for line_segment in line_segment_group.iter_values() {
        if plane.is_line_segment_available(line_segment) {
          return Err(Error::Expansion);
        }
      }
    }

    Ok(())
  }

  pub fn validate_gaps(&self, plane: &Plane) -> Result<(), Error> {
    if !self.option_validate_gaps {
      return Ok(());
    }

    if has_single_circuit(plane.get_line_segment_edges()) {
      Ok(())
    } else {
      Err(Error::Gaps)
    }
  }

  pub fn validate_vertex_types(&self, plane: &Plane) -> Result<(), Error> {
    if !self.option_validate_vertex_types {
      return Ok(());
    }

    for point_sequence in plane.points_end.iter_values() {
      if !plane.vertex_types.matches_exactly(&point_sequence.sequence) {
        return Err(Error::VertexType {
          sequence: hogg_circular_sequence::to_string_one(point_sequence.sequence),
        });
      }
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

    if let Some(flags) = flags {
      for flag in flags {
        match flag {
          Flag::Expanded => option_validate_expansion = true,
          Flag::Gaps => option_validate_gaps = true,
          Flag::Overlaps => option_validate_overlap = true,
          Flag::VertexTypes => option_validate_vertex_types = true,
        }
      }
    }

    Self {
      option_validate_expansion,
      option_validate_gaps,
      option_validate_overlap,
      option_validate_vertex_types,
    }
  }
}
