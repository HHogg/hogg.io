#[path = "./plane_tests.rs"]
#[cfg(test)]
mod tests;

use hogg_circular_sequence::SequenceStore;
use hogg_geometry::{ConvexHull, LineSegment, Point};
use hogg_spatial_grid_map::{location, MutBucketEntry, ResizeMethod, SpatialGridMap, PI};
use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use super::tile::Tile;
use super::vertex_types::VertexTypes;
use super::{Metrics, PointSequence, Stage};
use crate::notation::{
  Node, Notation, Operation, OriginIndex, OriginType, Path, Separator, Shape, Transform,
  TransformContinuous, TransformEccentric, TransformValue,
};
use crate::validation::{self, Validator};
use crate::TilingError;

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Plane {
  // Lookup<Tile.geometry.centroid> -> Tile
  pub tiles: SpatialGridMap<Tile>,
  // Lookup<Tile.geometry.centroid> -> Tile
  pub placement_tiles: SpatialGridMap<Tile>,
  pub seed_tile: Option<Tile>,

  // TODO: These shouldn't be needed for deserialization
  // but can be rebuilt from the Tiles. Would that be
  // a more performant approach to lower the data going
  // across workers?
  pub repetitions: u8,
  // Lookup<LineSegment.midPoint> -> LineSegment
  pub line_segments: SpatialGridMap<LineSegment>,
  // Lookup<Tile.geometry.centroid> -> [(Tile.geometry.centroid, Tile.shape)]
  pub points_center: SpatialGridMap<PointSequence>,
  // Lookup<Tile.geometry.centroid> -> [(Tile.geometry.centroid, Tile.shape)]
  pub points_center_extended: SpatialGridMap<PointSequence>,
  // Lookup<Vertex> -> [(Tile.geometry.centroid, Tile.shape)]
  pub points_end: SpatialGridMap<PointSequence>,
  // Lookup<Vertex> -> [(Tile.geometry.centroid, Tile.shape)]
  pub points_end_extended: SpatialGridMap<PointSequence>,
  // Lookup<LineSegment.midPoint> -> [(Tile.geometry.centroid, Tile.shape)]
  pub points_mid: SpatialGridMap<PointSequence>,
  // Lookup<LineSegment.midPoint> -> [(Tile.geometry.centroid, Tile.shape)]
  pub points_mid_extended: SpatialGridMap<PointSequence>,
  pub metrics: Metrics,
  pub stages: Vec<Stage>,

  #[serde(skip)]
  pub line_segments_by_shape_group: Vec<SpatialGridMap<LineSegment>>,
  #[serde(skip)]
  pub tiles_to_transform: Vec<Tile>,
  #[serde(skip)]
  pub stage_added_tile: bool,
  #[serde(skip)]
  pub validator: Validator,
  #[serde(skip)]
  pub vertex_types: VertexTypes,
}

impl Plane {
  pub fn with_expansion_phases(mut self, expansion_phases: u8) -> Self {
    self.repetitions = expansion_phases;
    self
  }

  pub fn with_validations(mut self, validations: Option<Vec<validation::Flag>>) -> Self {
    self.validator = validations.into();
    self
  }
  pub fn build(&mut self, notation: &Notation) -> Result<(), TilingError> {
    self.apply_path(&notation.path)?;

    if !notation.transforms.list.is_empty() {
      for (index, transform) in notation.transforms.list.iter().enumerate() {
        self.apply_transform(
          transform,
          Stage::Transform {
            index: index as u8,
            repetition_index: 0,
          },
        )?;
      }

      if self.repetitions > 0 {
        for repetition_index in 0..self.repetitions {
          for (index, transform) in notation.transforms.list.iter().enumerate() {
            self.apply_transform(
              transform,
              Stage::Transform {
                index: index as u8,
                repetition_index,
              },
            )?;
          }
        }

        self.validate_expanded()?;
        self.validate_gaps()?;
        self.validate_vertex_types()?;
      }
    }

    Ok(())
  }

  pub fn apply_path(&mut self, path: &Path) -> Result<(), TilingError> {
    self.metrics.start(Stage::Placement.to_string().as_str());
    self.metrics.create(validation::Flag::Overlaps.into());

    // Keep track of the number of line segments that need to be
    // skipped as we go around placing shapes.
    let mut skip = 0;

    // Keep track of the number of group separators we encounter
    // this is used for keeping track of the line segments that
    // are available for shapes in a group.
    let mut group_counter: usize = 0;

    // Keep track of the number of shapes we encounter
    // this is used for linking transformed polygons to the
    // original polygons (for shape_types).
    let mut shape_counter = 0;

    // Keep track of the number of points we encounter
    // this is used for linking transformed points to the
    // original points (for vertex_types).
    let mut points_counter = 0;

    path
      .nodes
      .iter()
      .try_for_each::<_, Result<(), TilingError>>(|node| {
        match node {
          Node::Seed(seed) => {
            let tile = Tile::default()
              .with_stage(Stage::Seed)
              .with_shape(seed.shape)
              .with_offset(seed.offset)
              .at_center();

            self.line_segments_by_shape_group.push(
              SpatialGridMap::new("line_segments_by_shape_group.seed")
                .with_resize_method(ResizeMethod::First),
            );
            self.seed_tile = Some(tile.clone());
            self.add_tile(Stage::Placement, tile)?;

            shape_counter += 1;
            points_counter += seed.shape as u8;

            self.complete_stage(Stage::Placement);
          }
          Node::Shape(Shape::Skip) => {
            skip += 1;
          }
          Node::Shape(shape) => {
            let line_segment = group_counter
              .checked_sub(1)
              .and_then(|group_index| self.get_available_line_segment_from_group(group_index, skip))
              .ok_or(TilingError::InvalidShapeInGroup {
                shape: shape.to_string(),
                group: group_counter.to_string(),
                reason: "no available line segment".into(),
              })?;

            let tile = Tile::default()
              .with_shape(*shape)
              .with_stage(Stage::Placement)
              .with_index(shape_counter)
              .with_stage_index(self.stages.len() as u16)
              .on_line_segment(&line_segment.flip(), points_counter - 1);

            self.add_tile(Stage::Placement, tile)?;

            shape_counter += 1;
            points_counter += *shape as u8 - 2;

            self.complete_stage(Stage::Placement);
          }
          Node::Separator(Separator::Group) => {
            self.line_segments_by_shape_group.push(
              SpatialGridMap::new("line_segments_by_shape_group.group")
                .with_resize_method(ResizeMethod::First),
            );
            group_counter += 1;
            skip = 0;
          }
          Node::Separator(Separator::Shape) => {}
          Node::Separator(Separator::Transform) => {
            Err(TilingError::Application {
              reason: "a transform separator made it's way into the Path".into(),
            })?;
          }
        }

        Ok(())
      })?;

    self.metrics.finish(Stage::Placement.to_string().as_str());
    self.metrics.finish(validation::Flag::Overlaps.into());

    Ok(())
  }

  /// Inserts a polygon into the tiling. If the polygon that occupies the
  /// same space already exists then it is not added.
  fn add_tile(&mut self, stage: Stage, tile: Tile) -> Result<(), TilingError> {
    let tile_location = tile.get_location();

    if self.tiles.contains(&tile_location) {
      self
        .metrics
        .increment(stage.to_string().as_str(), "polygons_skipped");
      return Ok(());
    }

    let tile_size = tile.get_size();
    let is_placement_tile = stage == Stage::Placement;
    let is_touching_placement_tile = !is_placement_tile && self.is_touching_placement_tile(&tile);

    // We add the polygon first so we can see it
    // if there are any errors
    self
      .tiles
      .insert(tile_location, tile_size, None, tile.clone());

    // We also add the polygon to the polygons to transform
    // to picked up on the next transform stage
    self.tiles_to_transform.push(tile.clone());

    self.stage_added_tile = true;
    self
      .metrics
      .increment(stage.to_string().as_str(), "polygons_added");

    if is_placement_tile {
      // We store the polygons from the placement phase
      // for convenience as they are the only original polygons,
      // all the other polygons after are transformed copies.
      self
        .placement_tiles
        .insert(tile_location, tile_size, None, tile.clone());

      self.points_center.insert(
        tile_location,
        tile_size,
        None,
        PointSequence::default()
          .with_center(tile.geometry.centroid)
          .with_size(tile.shape.into()),
      );
    } else if is_touching_placement_tile
      && !self.points_center.contains(&tile_location)
      && !self.points_center_extended.contains(&tile_location)
    {
      self.points_center_extended.insert(
        tile_location,
        tile_size,
        None,
        PointSequence::default()
          .with_center(tile.geometry.centroid)
          .with_size(tile.shape.into()),
      );
    }

    for line_segment in &tile.geometry.line_segments {
      let mid_point_location: location::Point = line_segment.mid_point().into();

      if is_placement_tile {
        // Store the line segments mid point
        // for looking up origins for transforms
        self.points_mid.insert(
          mid_point_location,
          line_segment.length(),
          Some(line_segment.theta()),
          PointSequence::default()
            .with_center(line_segment.mid_point())
            .with_size(2),
        );

        // Store the polygon's line segments
        // for looking up in the shape placement stage
        self
          .line_segments_by_shape_group
          .last_mut()
          .map(|line_segments| {
            line_segments.insert(
              mid_point_location,
              line_segment.length(),
              Some(line_segment.theta()),
              *line_segment,
            )
          });
      } else if is_touching_placement_tile
        && !self.points_mid.contains(&mid_point_location)
        && !self.points_mid_extended.contains(&mid_point_location)
      {
        self.points_mid_extended.insert(
          mid_point_location,
          line_segment.length(),
          Some(line_segment.theta()),
          PointSequence::default()
            .with_center(line_segment.mid_point())
            .with_size(2),
        );
      }

      self
        .line_segments
        .insert(
          mid_point_location,
          line_segment.length(),
          Some(line_segment.theta()),
          *line_segment,
        )
        .increment_counter("count");

      // Check that the line segment is not intersecting with any
      // other line segments around it. However we should only need to do
      // this up until the first transforms have been applied, after that
      // any future line segments should be valid.
      self.validate_overlaps(&tile, line_segment)?;

      // With the opposite tile we can start to fill in the
      // the shape and edge types.
      let opposite_tile = self.get_opposite_tile(&tile, line_segment).cloned();

      self.update_mid_point_sequence(&tile, line_segment);

      if let Some(opposite_tile) = opposite_tile {
        self.update_center_point_sequence(&tile, &opposite_tile);
        self.update_center_point_sequence(&opposite_tile, &tile);

        self.update_mid_point_sequence(&opposite_tile, line_segment);
      }
    }

    for point in tile.geometry.points.iter() {
      let location_point: location::Point = point.into();

      if is_placement_tile {
        // Store the polygon's end points
        // for looking up origins for transforms
        self.points_end.insert(
          location_point,
          1.0,
          None,
          PointSequence::default().with_center(*point),
        );
      } else if is_touching_placement_tile
        && !self.points_end.contains(&location_point)
        && !self.points_end_extended.contains(&location_point)
      {
        self.points_end_extended.insert(
          location_point,
          1.0,
          None,
          PointSequence::default().with_center(*point),
        );

        // It might be that some non-touching placement tiles
        // were added before this tile, so we need to update
        // the end point sequence with those tiles as well.
        let nearby_tiles = self
          .tiles
          .iter_values_around(&location_point, 2)
          .cloned()
          .collect::<Vec<_>>();

        for nearby_tile in nearby_tiles {
          if nearby_tile != tile && nearby_tile.geometry.points.contains(point) {
            self.update_end_point_sequence(&nearby_tile, point);
          }
        }
      }

      self.update_end_point_sequence(&tile, point);
    }

    Ok(())
  }

  pub fn is_empty(&self) -> bool {
    self.tiles.is_empty()
  }

  pub fn iter_tiles(&self) -> impl Iterator<Item = &Tile> {
    self.tiles.iter_values()
  }

  pub fn iter_placement_tiles(&self) -> impl Iterator<Item = &Tile> {
    self.placement_tiles.iter_values()
  }

  fn is_touching_placement_tile(&self, tile: &Tile) -> bool {
    for point in tile.geometry.points.iter() {
      if self.points_end.contains(&point.into()) {
        return true;
      }
    }

    false
  }

  fn get_opposite_tile(&self, tile: &Tile, line_segment: &LineSegment) -> Option<&Tile> {
    let location: location::Point = line_segment.mid_point().into();

    self
      .tiles
      .iter_values_around(&location, 2)
      .find(|nearby_tile| {
        *nearby_tile != tile && nearby_tile.geometry.line_segments.contains(line_segment)
      })
  }

  fn update_center_point_sequence(&mut self, a: &Tile, b: &Tile) {
    if let Some(mut sequence) = self.get_core_center_point_sequence_mut(&a.geometry.centroid) {
      sequence.value.insert(b.geometry.centroid, b.shape.into());
    }
  }

  fn update_mid_point_sequence(&mut self, tile: &Tile, line_segment: &LineSegment) {
    if let Some(mut sequence) = self.get_core_mid_point_sequence_mut(&line_segment.mid_point()) {
      sequence
        .value
        .insert(tile.geometry.centroid, tile.shape.into());
    }
  }

  fn update_end_point_sequence(&mut self, tile: &Tile, point: &Point) {
    if let Some(mut sequence) = self.get_core_end_point_sequence_mut(point) {
      sequence
        .value
        .insert(tile.geometry.centroid, tile.shape.into());
    }
  }

  pub fn get_convex_hull(&self) -> ConvexHull {
    ConvexHull::from_line_segments(self.get_line_segment_edges().iter_values())
  }

  fn complete_stage(&mut self, stage: Stage) {
    if self.stage_added_tile {
      self.stage_added_tile = false;
      self.stages.push(stage);
    }
  }

  pub fn is_line_segment_available(&self, line_segment: &LineSegment) -> bool {
    self
      .line_segments
      .get_counter(&line_segment.mid_point().into(), "count")
      .map_or(false, |count| *count <= 1)
  }

  pub fn get_line_segment_edges(&self) -> SpatialGridMap<LineSegment> {
    self
      .line_segments
      .filter(|line_segment| self.is_line_segment_available(line_segment))
  }

  /// Returns the line segments that only have a single shape
  /// touching it for the polygons from the placement phase
  /// for a given group. The order of these line segments is
  /// clockwise from the origin of the plane.
  fn get_available_line_segments_from_group(
    &self,
    group_index: usize,
  ) -> impl Iterator<Item = &LineSegment> {
    self.line_segments_by_shape_group[group_index]
      .iter_values()
      .filter(|line_segment| self.is_line_segment_available(line_segment))
  }

  /// Returns the line segment from a placement group that
  /// only has a single shape touching it. The `skip` parameter
  /// can be used to skip over a number of line segments.
  fn get_available_line_segment_from_group(
    &self,
    group_index: usize,
    skip: usize,
  ) -> Option<&LineSegment> {
    self
      .get_available_line_segments_from_group(group_index)
      .nth(skip)
  }

  /// Return the total number of points for a given origin type.
  /// This is the number of points that are available for
  /// transform origin indexes.
  pub fn get_point_count_by_type(&self, origin_type: &OriginType) -> usize {
    match origin_type {
      OriginType::CenterPoint => self.points_center.size(),
      OriginType::MidPoint => self.points_mid.size(),
      OriginType::EndPoint => self.points_end.size(),
    }
  }

  /// Returns a transform origin point by index and type
  pub fn get_point_by_index_and_type(
    &self,
    origin_type: &OriginType,
    origin_index: &OriginIndex,
  ) -> Option<Point> {
    match origin_type {
      OriginType::CenterPoint => self
        .points_center
        .iter_points()
        .nth(origin_index.value as usize)
        .map(|point| (*point).into()),
      OriginType::MidPoint => self
        .points_mid
        .iter_points()
        .nth(origin_index.value as usize)
        .map(|point| (*point).into()),
      OriginType::EndPoint => self
        .points_end
        .iter_points()
        .nth(origin_index.value as usize)
        .map(|point| (*point).into()),
    }
  }

  pub fn get_core_center_point_sequence(&self, point: &Point) -> Option<&PointSequence> {
    let location_point: location::Point = point.into();

    self
      .points_center
      .get_value(&location_point)
      .or_else(|| self.points_center_extended.get_value(&location_point))
  }

  pub fn get_core_center_complete_point_sequence(&self, point: &Point) -> Option<&PointSequence> {
    self
      .get_core_center_point_sequence(point)
      .filter(|point_sequence| point_sequence.is_complete())
  }

  pub fn get_core_center_point_sequence_mut(
    &mut self,
    point: &Point,
  ) -> Option<MutBucketEntry<'_, PointSequence>> {
    let location_point: location::Point = point.into();

    self
      .points_center
      .get_value_mut(&location_point)
      .or_else(|| self.points_center_extended.get_value_mut(&location_point))
  }

  pub fn get_core_end_point_sequence(&self, point: &Point) -> Option<&PointSequence> {
    let location_point: location::Point = point.into();

    self
      .points_end
      .get_value(&location_point)
      .or_else(|| self.points_end_extended.get_value(&location_point))
  }

  pub fn get_core_end_complete_point_sequence(&self, point: &Point) -> Option<&PointSequence> {
    self
      .get_core_end_point_sequence(point)
      .filter(|point_sequence| self.vertex_types.matches_exactly(&point_sequence.sequence))
  }

  pub fn get_core_end_point_sequence_mut(
    &mut self,
    point: &Point,
  ) -> Option<MutBucketEntry<'_, PointSequence>> {
    let location_point: location::Point = point.into();

    self
      .points_end
      .get_value_mut(&location_point)
      .or_else(|| self.points_end_extended.get_value_mut(&location_point))
  }

  pub fn get_core_mid_point_sequence(&self, point: &Point) -> Option<&PointSequence> {
    let location_point: location::Point = point.into();

    self
      .points_mid
      .get_value(&location_point)
      .or_else(|| self.points_mid_extended.get_value(&location_point))
  }

  pub fn get_core_mid_complete_point_sequence(&self, point: &Point) -> Option<&PointSequence> {
    self
      .get_core_mid_point_sequence(point)
      .filter(|point_sequence| point_sequence.is_complete())
  }

  pub fn get_core_mid_point_sequence_mut(
    &mut self,
    point: &Point,
  ) -> Option<MutBucketEntry<'_, PointSequence>> {
    let location_point: location::Point = point.into();

    self
      .points_mid
      .get_value_mut(&location_point)
      .or_else(|| self.points_mid_extended.get_value_mut(&location_point))
  }

  pub fn iter_core_center_complete_point_sequences(&self) -> impl Iterator<Item = &PointSequence> {
    self
      .points_center
      .iter_values()
      .chain(self.points_center_extended.iter_values())
      .filter(|point_sequence| point_sequence.is_complete())
  }

  pub fn iter_core_mid_complete_point_sequences(&self) -> impl Iterator<Item = &PointSequence> {
    self
      .points_mid
      .iter_values()
      .chain(self.points_mid_extended.iter_values())
      .filter(|point_sequence| point_sequence.is_complete())
  }

  pub fn iter_core_end_complete_point_sequences(&self) -> impl Iterator<Item = &PointSequence> {
    self
      .points_end
      .iter_values()
      .chain(self.points_end_extended.iter_values())
      .filter(|point_sequence| self.vertex_types.matches_exactly(&point_sequence.sequence))
  }

  pub fn get_shape_types(&self) -> SequenceStore {
    self
      .iter_core_center_complete_point_sequences()
      .map(|point_sequence| point_sequence.sequence)
      .collect::<Vec<_>>()
      .into()
  }

  pub fn get_edge_types(&self) -> SequenceStore {
    self
      .iter_core_mid_complete_point_sequences()
      .map(|point_sequence| point_sequence.sequence)
      .collect::<Vec<_>>()
      .into()
  }

  pub fn get_vertex_types(&self) -> SequenceStore {
    self
      .iter_core_end_complete_point_sequences()
      .map(|point_sequence| point_sequence.sequence)
      .collect::<Vec<_>>()
      .into()
  }

  pub fn get_reflection_line(
    &self,
    origin_index: &OriginIndex,
    origin_type: &OriginType,
  ) -> Option<LineSegment> {
    self
      .get_point_by_index_and_type(origin_type, origin_index)
      .and_then(|origin| match origin_type {
        OriginType::MidPoint => self.line_segments.get_value(&origin.into()).cloned(),
        _ => {
          if origin.eq(&Point::default()) {
            return Some(
              LineSegment::default()
                .with_start(Point::at(-1.0, 0.0))
                .with_end(Point::at(1.0, 0.0)),
            );
          }

          Some(
            LineSegment::default()
              .with_start(Point::default())
              .with_end(origin.multiply(2.0))
              .rotate(PI * 0.5, None),
          )
        }
      })
  }

  /// Applies a transform to the tiling, routing
  /// continuous and eccentric transforms to their
  /// respective functions.
  pub fn apply_transform(
    &mut self,
    transform: &Transform,
    stage: Stage,
  ) -> Result<(), TilingError> {
    let metric_key = stage.to_string();
    self.metrics.start(&metric_key);
    self.metrics.create(validation::Flag::Overlaps.into());

    match transform {
      Transform::Continuous(TransformContinuous { operation, value }) => {
        self.apply_continuous_transform(transform, stage, operation, value)?
      }
      Transform::Eccentric(TransformEccentric {
        operation,
        origin_type,
        origin_index,
      }) => {
        self.apply_eccentric_transform(transform, stage, operation, origin_type, origin_index)?
      }
    }

    self.metrics.finish(validation::Flag::Overlaps.into());
    self.metrics.finish(&metric_key);

    Ok(())
  }

  /// Applies a continuous transform to the tiling,
  /// routing the operation to the respective function.
  fn apply_continuous_transform(
    &mut self,
    transform: &Transform,
    stage: Stage,
    operation: &Operation,
    value: &TransformValue,
  ) -> Result<(), TilingError> {
    match operation {
      Operation::Reflect => self.apply_continuous_reflect_transform(transform, stage, value),
      Operation::Rotate => self.apply_continuous_rotate_transform(transform, stage, value),
    }
  }

  /// Applies an eccentric transform to the tiling,
  /// routing the operation to the respective function.
  fn apply_eccentric_transform(
    &mut self,
    transform: &Transform,
    stage: Stage,
    operation: &Operation,
    origin_type: &OriginType,
    origin_index: &OriginIndex,
  ) -> Result<(), TilingError> {
    match operation {
      Operation::Reflect => {
        self.apply_eccentric_reflect_transform(transform, stage, origin_type, origin_index)
      }
      Operation::Rotate => {
        self.apply_eccentric_rotate_transform(transform, stage, origin_type, origin_index)
      }
    }
  }

  /// Applies an eccentric reflection transform to the tiling.
  fn apply_continuous_reflect_transform(
    &mut self,
    _transform: &Transform,
    stage: Stage,
    transform_value: &TransformValue,
  ) -> Result<(), TilingError> {
    for value in transform_value.get_transform_values() {
      let stage_index = self.stages.len() as u16;
      let p1 = Point::at(0.0, 0.0);
      let p2 = Point::at((value - PI * 0.5).cos(), (value - PI * 0.5).sin());
      let line_segment = LineSegment::default().with_start(p1).with_end(p2);

      for i in 0..self.tiles_to_transform.len() {
        let tile = self
          .tiles_to_transform
          .get(i)
          .ok_or(TilingError::InvalidTransform {
            transform: "reflect".into(),
            reason: "polygon not found".into(),
          })?;

        let next_tile = tile
          .clone()
          .with_stage(stage)
          .with_stage_index(stage_index)
          .reflect(&line_segment);

        self.add_tile(stage, next_tile)?;
      }

      self.complete_stage(stage);
    }

    Ok(())
  }

  /// Applies an continuous rotation transform to the tiling.
  fn apply_continuous_rotate_transform(
    &mut self,
    _transform: &Transform,
    stage: Stage,
    transform_value: &TransformValue,
  ) -> Result<(), TilingError> {
    for value in transform_value.get_transform_values() {
      let stage_index = self.stages.len() as u16;

      for i in 0..self.tiles_to_transform.len() {
        let tile = self
          .tiles_to_transform
          .get(i)
          .ok_or(TilingError::InvalidTransform {
            transform: "rotate".into(),
            reason: "tile not found".into(),
          })?;

        let next_tile = tile
          .clone()
          .with_stage(stage)
          .with_stage_index(stage_index)
          .rotate(value, None);

        self.add_tile(stage, next_tile)?;
      }

      self.complete_stage(stage);
    }

    Ok(())
  }

  /// Applies an eccentric reflection transform to the tiling.
  fn apply_eccentric_reflect_transform(
    &mut self,
    transform: &Transform,
    stage: Stage,
    origin_type: &OriginType,
    origin_index: &OriginIndex,
  ) -> Result<(), TilingError> {
    let line_segment =
      self
        .get_reflection_line(origin_index, origin_type)
        .ok_or(TilingError::InvalidTransform {
          transform: transform.to_string(),
          reason: "reflection line segment not found".into(),
        })?;

    let stage_index = self.stages.len() as u16;

    std::mem::take(&mut self.tiles_to_transform)
      .iter()
      .map(|tile| {
        tile
          .clone()
          .with_stage(stage)
          .with_stage_index(stage_index)
          .reflect(&line_segment)
      })
      .try_for_each(|tile| self.add_tile(stage, tile))?;

    self.complete_stage(stage);

    Ok(())
  }

  /// Applies an eccentric rotation transform to the tiling.
  fn apply_eccentric_rotate_transform(
    &mut self,
    transform: &Transform,
    stage: Stage,
    origin_type: &OriginType,
    origin_index: &OriginIndex,
  ) -> Result<(), TilingError> {
    let tiles = std::mem::take(&mut self.tiles_to_transform);

    let origin = self
      .get_point_by_index_and_type(origin_type, origin_index)
      .ok_or(TilingError::InvalidTransform {
        transform: transform.to_string(),
        reason: "origin point not found".into(),
      })?;

    let stage_index = self.stages.len() as u16;

    tiles
      .iter()
      .map(|tile| {
        tile
          .clone()
          .with_stage(stage)
          .with_stage_index(stage_index)
          .rotate(PI, Some(&origin))
      })
      .try_for_each(|tile| self.add_tile(stage, tile))?;

    self.complete_stage(stage);

    Ok(())
  }

  fn validate_overlaps(
    &mut self,
    tile: &Tile,
    line_segment: &LineSegment,
  ) -> Result<(), TilingError> {
    self.metrics.resume(validation::Flag::Overlaps.into());
    let result = self.validator.validate_overlaps(self, tile, line_segment);
    self.metrics.pause(validation::Flag::Overlaps.into());
    result.map_err(|error| error.into())
  }

  fn validate_gaps(&mut self) -> Result<(), TilingError> {
    self.metrics.start(validation::Flag::Gaps.into());
    let result = self.validator.validate_gaps(self);
    self.metrics.finish(validation::Flag::Gaps.into());
    result.map_err(|error| error.into())
  }

  fn validate_expanded(&mut self) -> Result<(), TilingError> {
    self.metrics.start(validation::Flag::Expanded.into());
    let result = self.validator.validate_expanded(self);
    self.metrics.finish(validation::Flag::Expanded.into());
    result.map_err(|error| error.into())
  }

  fn validate_vertex_types(&mut self) -> Result<(), TilingError> {
    self.metrics.start(validation::Flag::VertexTypes.into());
    let result = self.validator.validate_vertex_types(self);
    self.metrics.finish(validation::Flag::VertexTypes.into());
    result.map_err(|error| error.into())
  }
}

impl Default for Plane {
  fn default() -> Self {
    Self {
      repetitions: 0,
      metrics: Metrics::default(),
      validator: Validator::default(),
      vertex_types: VertexTypes::default(),

      line_segments: SpatialGridMap::new("line_segments").with_resize_method(ResizeMethod::First),
      line_segments_by_shape_group: Vec::new(),
      points_center: SpatialGridMap::new("points_center").with_resize_method(ResizeMethod::Minimum),
      points_center_extended: SpatialGridMap::new("points_center_extended")
        .with_resize_method(ResizeMethod::Minimum),
      points_end: SpatialGridMap::new("points_end").with_resize_method(ResizeMethod::First),
      points_end_extended: SpatialGridMap::new("points_end_extended")
        .with_resize_method(ResizeMethod::First),
      points_mid: SpatialGridMap::new("points_mid").with_resize_method(ResizeMethod::First),
      points_mid_extended: SpatialGridMap::new("points_mid_extended")
        .with_resize_method(ResizeMethod::First),
      tiles: SpatialGridMap::new("tiles").with_resize_method(ResizeMethod::Minimum),
      placement_tiles: SpatialGridMap::new("tiles_placement")
        .with_resize_method(ResizeMethod::Minimum),
      tiles_to_transform: Vec::new(),
      seed_tile: None,
      stage_added_tile: false,
      stages: Vec::new(),
    }
  }
}
