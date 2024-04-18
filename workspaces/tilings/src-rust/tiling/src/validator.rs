use std::collections::VecDeque;

use serde::{Deserialize, Serialize};
use thiserror::Error;
use typeshare::typeshare;

use crate::Polygons;

///
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

  /// Checks that none of the polygons intersect
  /// with each other. See the polygon implementation
  /// for more details on how this is done.
  pub fn validate_overlaps(&self, polygons: &Polygons) -> Result<(), ValidationError> {
    if !self.option_validate_overlap {
      return Ok(());
    }

    for a in &polygons.polygons {
      for b in &polygons.polygons {
        if a != b && a.intersects(b) {
          return Err(ValidationError::Overlaps);
        }
      }
    }

    Ok(())
  }

  /// Checks that the tiling expanded by ensuring all of edges
  /// of the polygons placed in the placement phase now have
  /// shapes attached to them
  pub fn validate_expanded(&self, polygons: &Polygons) -> Result<(), ValidationError> {
    if !self.option_validate_expansion {
      return Ok(());
    }

    for line_segment_group in &polygons.line_segments_by_shape_group {
      for line_segment in line_segment_group {
        if polygons.edge_type_store.get_count(line_segment) <= 1 {
          return Err(ValidationError::Expansion);
        }
      }
    }

    Ok(())
  }

  /// A limited tessellation without any gaps in the center would
  /// have a single border that is made up of connected line segments.
  /// A tessellation with gaps in the center would have multiple
  /// borders that are made up of connected line segments.
  ///
  /// A line segment that acts as a border would have only 1 occurrence,
  /// and a line segment that is not a border would have 2 occurrences.
  ///
  /// Taking the first line segment, we find it's full border by
  /// finding all connected line segments, and removing them from the
  /// entire set.
  ///
  /// If there are any border line segments left over in the set, then the
  /// tessellation has gaps.
  pub fn validate_gaps(&self, polygons: &Polygons) -> Result<(), ValidationError> {
    if !self.option_validate_gaps {
      return Ok(());
    }

    let mut line_segments: VecDeque<_> = polygons.edge_type_store.get_edges().collect();
    let start = line_segments.pop_front();

    let mut current = line_segments.pop_front();
    let mut first_current = current;
    let mut previous = start;

    while let (Some(s), Some(p), Some(c)) = (start, previous, current) {
      // If the current line segment is not connected to the previous
      // we'll put it back and take the next one.
      if !p.is_connected(c) {
        line_segments.push_back(c);
        current = line_segments.pop_front();

        // If we've gone through the entire list and haven't found
        // a connected line segment, then we have a problem.
        if current == first_current {
          return Err(ValidationError::Application {
            reason: "while checking for gaps, found an edge that did not form a link".into(),
          });
        }

        continue;
      }

      // If the current line segment is connected to the starting
      // line segment, we have completed a full border
      if p != s && c.is_connected(s) {
        break;
      }

      // If the current line segment is connected to the previous
      // line segment, we can drop the previous one and move on.
      previous = Some(c);
      current = line_segments.pop_front();
      first_current = current;
    }

    if line_segments.is_empty() {
      Ok(())
    } else {
      Err(ValidationError::Gaps)
    }
  }

  pub fn validate_vertex_types(&self, _polygons: &Polygons) -> Result<(), ValidationError> {
    if !self.option_validate_vertex_types {
      return Ok(());
    }

    Ok(())
  }

  pub fn validate_edge_types(&self, _polygons: &Polygons) -> Result<(), ValidationError> {
    if !self.option_validate_edge_types {
      return Ok(());
    }

    Ok(())
  }

  pub fn validate_shape_types(&self, _polygons: &Polygons) -> Result<(), ValidationError> {
    if !self.option_validate_shape_types {
      return Ok(());
    }

    Ok(())
  }
}

impl From<Option<Vec<ValidationFlag>>> for Validator {
  fn from(flags: Option<Vec<ValidationFlag>>) -> Self {
    let mut option_validate_expansion = false;
    let mut option_validate_gaps = false;
    let mut option_validate_overlap = false;
    let mut option_validate_vertex_types = false;
    let mut option_validate_edge_types = false;
    let mut option_validate_shape_types = false;

    if let Some(flags) = flags {
      for flag in flags {
        match flag {
          ValidationFlag::Expansion => option_validate_expansion = true,
          ValidationFlag::Gaps => option_validate_gaps = true,
          ValidationFlag::Overlaps => option_validate_overlap = true,
          ValidationFlag::VertexTypes => option_validate_vertex_types = true,
          ValidationFlag::EdgeTypes => option_validate_edge_types = true,
          ValidationFlag::ShapeTypes => option_validate_shape_types = true,
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

///
#[derive(Clone, Debug, Deserialize, Error, Serialize)]
#[serde(tag = "type", content = "content")]
#[typeshare]
pub enum ValidationError {
  #[error("Application error -> {reason}")]
  Application { reason: String },
  #[error("Overall size did not expand")]
  Expansion,
  #[error("Gaps between shapes")]
  Gaps,
  #[error("Shapes overlap")]
  Overlaps,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[typeshare]
pub enum ValidationFlag {
  Overlaps,
  Gaps,
  Expansion,
  VertexTypes,
  EdgeTypes,
  ShapeTypes,
}

impl ValidationFlag {
  pub fn all() -> Vec<Self> {
    vec![
      Self::Overlaps,
      Self::Gaps,
      Self::Expansion,
      Self::VertexTypes,
      Self::EdgeTypes,
      Self::ShapeTypes,
    ]
  }
}
