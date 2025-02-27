use std::collections::HashMap;

use hogg_gap_validation::has_single_circuit;
use hogg_geometry::LineSegment;
use hogg_spatial_grid_map::location;

use super::Error;
use crate::build::{FeatureToggle, Plane, Tile};

#[derive(Clone, Debug, Default)]
pub struct Validator {
  option_validate_expansion: bool,
  option_validate_gaps: bool,
  option_validate_overlaps: bool,
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
    tile: &Tile,
    line_segment: &LineSegment,
  ) -> Result<(), Error> {
    if !self.option_validate_overlaps {
      return Ok(());
    }

    let location: location::Point = line_segment.mid_point().into();
    let line_segment_count = *plane
      .line_segments
      .get_counter(&location, "count")
      .unwrap_or(&0);

    // If a line segment has more than 2 polygons touching it
    // then it's overlapping with another line segment
    if line_segment_count > 2 {
      return Err(Error::Overlaps {
        reason: format!("line segment count of {} is > 2", line_segment_count),
      });
    }

    let nearby_line_segments = plane
      .line_segments
      .iter_values_around(&location, 1)
      .filter(|other| *other != line_segment);

    // If a line segment intersects with another line segment
    // then it's overlapping with another line segment
    for nearby_line_segment in nearby_line_segments {
      if line_segment.is_intersecting_with_polygon_line_segment(nearby_line_segment) {
        return Err(Error::Overlaps {
          reason: "nearby line segments intersecting".to_string(),
        });
      }
    }

    let nearby_tiles = plane
      .tiles
      .iter_values_around(&tile.geometry.centroid.into(), 1)
      .filter(|other| *other != tile);

    // If the distance between the centroids of 2 polygons is
    // greater than the sum of their apothems then they are not
    // overlapping.
    for nearby_tile in nearby_tiles {
      if tile.geometry.intersects(&nearby_tile.geometry) {
        return Err(Error::Overlaps {
          reason: "nearby by tiles intersecting".to_string(),
        });
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

impl From<&HashMap<FeatureToggle, bool>> for Validator {
  fn from(feature_toggles: &HashMap<FeatureToggle, bool>) -> Self {
    Self {
      option_validate_expansion: feature_toggles
        .get(&FeatureToggle::ValidateExpanded)
        .copied()
        .unwrap_or(false),
      option_validate_gaps: feature_toggles
        .get(&FeatureToggle::ValidateGaps)
        .copied()
        .unwrap_or(false),
      option_validate_overlaps: feature_toggles
        .get(&FeatureToggle::ValidateOverlaps)
        .copied()
        .unwrap_or(false),
      option_validate_vertex_types: feature_toggles
        .get(&FeatureToggle::ValidateVertexTypes)
        .copied()
        .unwrap_or(false),
    }
  }
}
