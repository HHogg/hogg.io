use hogg_circular_sequence::{point_sequence, PointSequence};
use hogg_geometry::Point;
use hogg_spatial_grid_map::{location, MutBucketEntry, SpatialGridMap};
use hogg_tilings_validation_vertex_types::matches_known_vertex_type;

use super::{Stage, Tile};

#[derive(Clone, Debug, Default)]
pub struct PointSequences {
  // Lookup<Tile.geometry.centroid> -> [(Tile.geometry.centroid, Tile.shape)]
  points_center_primary: SpatialGridMap<PointSequence>,
  // Lookup<Tile.geometry.centroid> -> [(Tile.geometry.centroid, Tile.shape)]
  points_center_secondary: SpatialGridMap<PointSequence>,
  // Lookup<Tile.geometry.centroid> -> [(Tile.geometry.centroid, Tile.shape)]
  points_center_tertiary: SpatialGridMap<PointSequence>,
  // Lookup<Vertex> -> [(Tile.geometry.centroid, Tile.shape)]
  points_end_primary: SpatialGridMap<PointSequence>,
  // Lookup<Vertex> -> [(Tile.geometry.centroid, Tile.shape)]
  points_end_secondary: SpatialGridMap<PointSequence>,
  // Lookup<Vertex> -> [(Tile.geometry.centroid, Tile.shape)]
  points_end_tertiary: SpatialGridMap<PointSequence>,
  // Lookup<LineSegment.midPoint> -> [(Tile.geometry.centroid, Tile.shape)]
  points_mid_primary: SpatialGridMap<PointSequence>,
  // Lookup<LineSegment.midPoint> -> [(Tile.geometry.centroid, Tile.shape)]
  points_mid_secondary: SpatialGridMap<PointSequence>,
  // Lookup<LineSegment.midPoint> -> [(Tile.geometry.centroid, Tile.shape)]
  points_mid_tertiary: SpatialGridMap<PointSequence>,
}

impl PointSequences {
  pub fn get_center_point_sequence(&self, point: &Point) -> Option<&PointSequence> {
    self
      .points_center_primary
      .get_value(&point.into())
      .or_else(|| self.points_center_secondary.get_value(&point.into()))
      .or_else(|| self.points_center_tertiary.get_value(&point.into()))
  }

  pub fn get_center_point_sequence_mut(
    &mut self,
    point: &Point,
  ) -> Option<MutBucketEntry<'_, PointSequence>> {
    self
      .points_center_primary
      .get_value_mut(&point.into())
      .or_else(|| self.points_center_secondary.get_value_mut(&point.into()))
      .or_else(|| self.points_center_tertiary.get_value_mut(&point.into()))
  }

  pub fn get_primary_center_point_sequence(&self, point: &Point) -> Option<&PointSequence> {
    self.points_center_primary.get_value(&point.into())
  }

  pub fn get_core_center_point_sequence(&self, point: &Point) -> Option<&PointSequence> {
    let location_point: location::Point = point.into();

    self
      .points_center_primary
      .get_value(&location_point)
      .or_else(|| self.points_center_secondary.get_value(&location_point))
  }

  pub fn get_core_center_point_sequence_mut(
    &mut self,
    point: &Point,
  ) -> Option<MutBucketEntry<'_, PointSequence>> {
    let location_point: location::Point = point.into();

    self
      .points_center_primary
      .get_value_mut(&location_point)
      .or_else(|| self.points_center_secondary.get_value_mut(&location_point))
  }

  pub fn get_core_center_complete_point_sequence(&self, point: &Point) -> Option<&PointSequence> {
    self
      .get_core_center_point_sequence(point)
      .filter(|point_sequence| point_sequence.is_complete())
  }

  pub fn get_end_point_sequence(&self, point: &Point) -> Option<&PointSequence> {
    self
      .points_end_primary
      .get_value(&point.into())
      .or_else(|| self.points_end_secondary.get_value(&point.into()))
      .or_else(|| self.points_end_tertiary.get_value(&point.into()))
  }

  pub fn get_end_point_sequence_mut(
    &mut self,
    point: &Point,
  ) -> Option<MutBucketEntry<'_, PointSequence>> {
    self
      .points_end_primary
      .get_value_mut(&point.into())
      .or_else(|| self.points_end_secondary.get_value_mut(&point.into()))
      .or_else(|| self.points_end_tertiary.get_value_mut(&point.into()))
  }

  pub fn get_primary_end_point_sequence(&self, point: &Point) -> Option<&PointSequence> {
    self.points_end_primary.get_value(&point.into())
  }

  pub fn get_primary_end_point_sequence_mut(
    &mut self,
    point: &Point,
  ) -> Option<MutBucketEntry<'_, PointSequence>> {
    self.points_end_primary.get_value_mut(&point.into())
  }

  pub fn get_core_end_point_sequence(&self, point: &Point) -> Option<&PointSequence> {
    let location_point: location::Point = point.into();

    self
      .points_end_primary
      .get_value(&location_point)
      .or_else(|| self.points_end_secondary.get_value(&location_point))
  }

  pub fn get_core_end_point_sequence_mut(
    &mut self,
    point: &Point,
  ) -> Option<MutBucketEntry<'_, PointSequence>> {
    let location_point: location::Point = point.into();

    self
      .points_end_primary
      .get_value_mut(&location_point)
      .or_else(|| self.points_end_secondary.get_value_mut(&location_point))
  }

  pub fn get_core_end_complete_point_sequence(&self, point: &Point) -> Option<&PointSequence> {
    self
      .get_core_end_point_sequence(point)
      .filter(|point_sequence| matches_known_vertex_type(&point_sequence.sequence))
  }

  pub fn get_mid_point_sequence(&self, point: &Point) -> Option<&PointSequence> {
    let location_point: location::Point = point.into();

    self
      .points_mid_primary
      .get_value(&location_point)
      .or_else(|| self.points_mid_secondary.get_value(&location_point))
      .or_else(|| self.points_mid_tertiary.get_value(&location_point))
  }

  pub fn get_mid_point_sequence_mut(
    &mut self,
    point: &Point,
  ) -> Option<MutBucketEntry<'_, PointSequence>> {
    let location_point: location::Point = point.into();

    self
      .points_mid_primary
      .get_value_mut(&location_point)
      .or_else(|| self.points_mid_secondary.get_value_mut(&location_point))
      .or_else(|| self.points_mid_tertiary.get_value_mut(&location_point))
  }

  pub fn get_primary_mid_point_sequence(&self, point: &Point) -> Option<&PointSequence> {
    self.points_mid_primary.get_value(&point.into())
  }

  pub fn get_core_mid_point_sequence(&self, point: &Point) -> Option<&PointSequence> {
    let location_point: location::Point = point.into();

    self
      .points_mid_primary
      .get_value(&location_point)
      .or_else(|| self.points_mid_secondary.get_value(&location_point))
  }

  pub fn get_core_mid_point_sequence_mut(
    &mut self,
    point: &Point,
  ) -> Option<MutBucketEntry<'_, PointSequence>> {
    let location_point: location::Point = point.into();

    self
      .points_mid_primary
      .get_value_mut(&location_point)
      .or_else(|| self.points_mid_secondary.get_value_mut(&location_point))
  }

  pub fn get_center_points_primary_count(&self) -> usize {
    self.points_center_primary.size()
  }

  pub fn get_mid_points_primary_count(&self) -> usize {
    self.points_mid_primary.size()
  }

  pub fn get_end_points_primary_count(&self) -> usize {
    self.points_end_primary.size()
  }

  pub fn iter_center_points_primary(&self) -> impl Iterator<Item = &PointSequence> {
    self.points_center_primary.iter_values()
  }

  pub fn iter_center_points_secondary(&self) -> impl Iterator<Item = &PointSequence> {
    self.points_center_secondary.iter_values()
  }

  pub fn iter_core_center_complete_point_sequences(&self) -> impl Iterator<Item = &PointSequence> {
    self
      .points_center_primary
      .iter_values()
      .chain(self.points_center_secondary.iter_values())
      .filter(|point_sequence| point_sequence.is_complete())
  }

  pub fn iter_mid_points_primary(&self) -> impl Iterator<Item = &PointSequence> {
    self.points_mid_primary.iter_values()
  }

  pub fn iter_mid_points_secondary(&self) -> impl Iterator<Item = &PointSequence> {
    self.points_mid_secondary.iter_values()
  }

  pub fn iter_core_mid_complete_point_sequences(&self) -> impl Iterator<Item = &PointSequence> {
    self
      .points_mid_primary
      .iter_values()
      .chain(self.points_mid_secondary.iter_values())
      .filter(|point_sequence| point_sequence.is_complete())
  }

  pub fn iter_end_points_primary(&self) -> impl Iterator<Item = &PointSequence> {
    self.points_end_primary.iter_values()
  }

  pub fn iter_end_points_secondary(&self) -> impl Iterator<Item = &PointSequence> {
    self.points_end_secondary.iter_values()
  }

  pub fn iter_core_end_complete_point_sequences(&self) -> impl Iterator<Item = &PointSequence> {
    self
      .points_end_primary
      .iter_values()
      .chain(self.points_end_secondary.iter_values())
      .filter(|point_sequence| matches_known_vertex_type(&point_sequence.sequence))
  }

  fn update_center_point_sequence(
    &mut self,
    center_point: &Point,
    entry_centroid: Point,
    entry_shape: u8,
  ) -> bool {
    if let Some(mut sequence) = self.get_center_point_sequence_mut(center_point) {
      return sequence.value.insert(entry_centroid, entry_shape);
    }

    false
  }

  fn update_end_point_sequence(&mut self, point: &Point, tile: &Tile) -> bool {
    if let Some(mut sequence) = self.get_end_point_sequence_mut(point) {
      return sequence
        .value
        .insert(tile.geometry.centroid, tile.shape.into());
    }

    false
  }

  fn update_mid_point_sequence(&mut self, mid_point: &Point, tile: &Tile) -> bool {
    if let Some(mut sequence) = self.get_mid_point_sequence_mut(mid_point) {
      return sequence
        .value
        .insert(tile.geometry.centroid, tile.shape.into());
    }

    false
  }

  fn is_tile_placement_tile(&self, tile: &Tile) -> bool {
    tile.stage == Stage::Placement
  }

  fn is_tile_touching_placement_tile(&self, tile: &Tile) -> bool {
    if self.is_tile_placement_tile(tile) {
      return false;
    }

    for point in tile.geometry.points.iter() {
      if self.points_end_primary.contains(&point.into()) {
        return true;
      }
    }

    false
  }

  fn get_opposite_mid_point_entry(
    &self,
    tile: &Tile,
    mid_point: &Point,
  ) -> Option<point_sequence::Entry> {
    self
      .get_mid_point_sequence(mid_point)
      .and_then(|mid_point_sequence| mid_point_sequence.find_opposite(&tile.geometry.centroid))
      .cloned()
  }

  pub fn register_tile(&mut self, tile: &Tile, register_extended_tiles: bool) {
    let tile_location = tile.get_location();
    let tile_size = tile.get_size();
    let is_placement_tile = self.is_tile_placement_tile(tile);
    let is_touching_placement_tile =
      register_extended_tiles && self.is_tile_touching_placement_tile(tile);

    if is_placement_tile {
      self.points_center_primary.insert(
        tile_location,
        tile_size,
        None,
        PointSequence::default()
          .with_center(tile.geometry.centroid)
          .with_max_size(tile.shape.into()),
      );
    } else if register_extended_tiles {
      if is_touching_placement_tile {
        if !self.points_center_primary.contains(&tile_location) {
          let point_sequence = self
            .points_center_tertiary
            .take(&tile_location)
            .unwrap_or_else(|| {
              PointSequence::default()
                .with_center(tile.geometry.centroid)
                .with_max_size(tile.shape.into())
            });

          self
            .points_center_secondary
            .insert(tile_location, tile_size, None, point_sequence);
        }
      } else if !self.points_center_secondary.contains(&tile_location) {
        self.points_center_tertiary.insert(
          tile_location,
          tile_size,
          None,
          PointSequence::default()
            .with_center(tile.geometry.centroid)
            .with_max_size(tile.shape.into()),
        );
      }
    }

    for line_segment in &tile.geometry.line_segments {
      let mid_point = line_segment.mid_point();
      let mid_point_location: location::Point = mid_point.into();

      if is_placement_tile {
        // Store the line segments mid point
        // for looking up origins for transforms
        self.points_mid_primary.insert(
          mid_point_location,
          line_segment.length(),
          Some(line_segment.theta()),
          PointSequence::default()
            .with_center(mid_point)
            .with_max_size(2),
        );
      } else if register_extended_tiles {
        if is_touching_placement_tile {
          if !self.points_mid_primary.contains(&mid_point_location) {
            let point_sequence = self
              .points_mid_tertiary
              .take(&mid_point_location)
              .unwrap_or_else(|| {
                PointSequence::default()
                  .with_center(mid_point)
                  .with_max_size(2)
              });

            self.points_mid_secondary.insert(
              mid_point_location,
              line_segment.length(),
              Some(line_segment.theta()),
              point_sequence,
            );
          }
        } else if !self.points_mid_secondary.contains(&mid_point_location) {
          self.points_mid_tertiary.insert(
            mid_point_location,
            line_segment.length(),
            Some(line_segment.theta()),
            PointSequence::default()
              .with_center(mid_point)
              .with_max_size(2),
          );
        }
      }

      // Updating the mid point sequence to link this
      // line segment to the polygon
      self.update_mid_point_sequence(&mid_point, tile);

      // With the opposite tile we can start to fill in the
      // the shape and edge types.
      if let Some(point_sequence_entry) = self.get_opposite_mid_point_entry(tile, &mid_point) {
        self.update_center_point_sequence(
          &tile.geometry.centroid,
          point_sequence_entry.point,
          point_sequence_entry.value,
        );

        self.update_center_point_sequence(
          &point_sequence_entry.point,
          tile.geometry.centroid,
          tile.shape.into(),
        );
      }
    }

    for point in tile.geometry.points.iter() {
      let location_point: location::Point = point.into();

      if is_placement_tile {
        // Store the polygon's end points
        // for looking up origins for transforms
        self.points_end_primary.insert(
          location_point,
          1.0,
          None,
          PointSequence::default().with_center(*point),
        );
      } else if register_extended_tiles {
        if is_touching_placement_tile {
          if !self.points_end_primary.contains(&location_point) {
            let point_sequence = self
              .points_end_tertiary
              .take(&location_point)
              .unwrap_or_else(|| PointSequence::default().with_center(*point));

            self
              .points_end_secondary
              .insert(location_point, 1.0, None, point_sequence);
          }
        } else if !self.points_end_secondary.contains(&location_point) {
          self.points_end_tertiary.insert(
            location_point,
            1.0,
            None,
            PointSequence::default().with_center(*point),
          );
        }
      }

      self.update_end_point_sequence(point, tile);
    }
  }
}
