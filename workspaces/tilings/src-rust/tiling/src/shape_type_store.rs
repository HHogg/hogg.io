use std::collections::HashMap;

use serde::Serialize;
use typeshare::typeshare;

use crate::edge_type_store::EdgeTypeStore;
use crate::pattern_radial::{Location, PatternRadial};
use crate::{Patterns, Point, Polygon, TilingError, ValidationError};

#[derive(Clone, Debug, Default, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct ShapeTypeStore {
  #[typeshare(serialized_as = "Vec<String>")]
  pub shape_types: Patterns,
  #[serde(skip)]
  shape_types_by_point: HashMap<Point, PatternRadial>,
}

impl ShapeTypeStore {
  pub fn validate(&mut self) -> Result<(), TilingError> {
    if self.shape_types.is_empty() {
      return Err(
        ValidationError::PatternRadial {
          reason: "No shapes types found".into(),
        }
        .into(),
      );
    }

    Ok(())
  }

  ///
  pub fn annotate_polygon(&mut self, polygon: &mut Polygon) {
    self
      .shape_types_by_point
      .get(&polygon.centroid)
      .map(|shape_type| {
        if shape_type.is_full() {
          polygon.shape_type = self.shape_types.index_of(&shape_type.pattern);
        }
      });
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
    polygon: &mut Polygon,
    edge_type_store: &EdgeTypeStore,
  ) -> Result<(), TilingError> {
    for line_segment in polygon.line_segments.iter() {
      let pattern_radial = edge_type_store
        .get(line_segment)
        .ok_or(TilingError::Application {
          reason: "Edge not available in EdgeTypeStore".into(),
        })?;

      if let (Some(this_location), Some(other_location)) =
        pattern_radial.get_location_pair(&polygon.centroid)
      {
        self.update_shape_type(this_location, other_location)?;
        self.update_shape_type(other_location, this_location)?;
      }
    }

    Ok(())
  }

  fn update_shape_type(
    &mut self,
    location_a: &Location,
    location_b: &Location,
  ) -> Result<(), TilingError> {
    let shape_type = self
      .shape_types_by_point
      .entry(location_a.point)
      .or_insert_with(|| PatternRadial::new(location_a.point, Some(location_a.shape)));

    shape_type.insert_location(*location_b)?;

    if shape_type.is_full() {
      self.shape_types.insert_pattern(shape_type.pattern.clone());
    }

    Ok(())
  }
}
