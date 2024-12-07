use std::collections::BTreeSet;
use std::f64::consts::PI;

use circular_sequence::SequenceStore;
use serde::{Deserialize, Serialize};
use spatial_grid_map::utils::compare_coordinate;
use spatial_grid_map::{ResizeMethod, SpatialGridMap};
use typeshare::typeshare;

use super::phase::Phase;
use super::vertex_types::VertexTypes;
use super::{Metrics, PointSequence};
use crate::geometry::{ConvexHull, LineSegment, Point, Polygon};
use crate::notation::{
  Node, Notation, Operation, OriginIndex, OriginType, Path, Separator, Shape, Transform,
  TransformContinuous, TransformEccentric, TransformValue,
};
use crate::validation::{self, Validator};
use crate::TilingError;

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Plane {
  pub polygons: SpatialGridMap<Polygon>,
  pub polygons_placement: SpatialGridMap<Polygon>,
  pub seed_polygon: Option<Polygon>,

  // TODO: These shouldn't be needed for deserialization
  // but can be rebuilt from the polygons. Would that be
  // a more performant approach to lower the data going
  // across workers?
  pub convex_hull: ConvexHull,
  pub expansion_phases: u8,
  pub line_segments: SpatialGridMap<LineSegment>,
  pub points_center: SpatialGridMap<PointSequence>,
  pub points_end: SpatialGridMap<PointSequence>,
  pub points_mid: SpatialGridMap<PointSequence>,
  pub metrics: Metrics,
  pub stages: Vec<Stage>,

  #[serde(skip)]
  pub line_segments_by_shape_group: Vec<BTreeSet<LineSegment>>,
  #[serde(skip)]
  pub stage_added_polygon: bool,
  #[serde(skip)]
  pub stage_started_transforms: bool,
  #[serde(skip)]
  pub validator: Validator,
  #[serde(skip)]
  pub vertex_types: VertexTypes,
}

impl Plane {
  pub fn with_expansion_phases(&mut self, expansion_phases: u8) {
    self.expansion_phases = expansion_phases;
  }

  pub fn with_validations(&mut self, validations: Option<Vec<validation::Flag>>) {
    self.validator = validations.into();
  }

  pub fn with_metrics(&mut self, metrics: Metrics) {
    self.metrics = metrics;
  }

  pub fn reset(&mut self) {
    self.convex_hull = ConvexHull::default();
    self.line_segments = SpatialGridMap::default().with_resize_method(ResizeMethod::Maximum);
    self.line_segments_by_shape_group = Vec::new();
    self.points_center = SpatialGridMap::default().with_resize_method(ResizeMethod::Maximum);
    self.points_end = SpatialGridMap::default().with_resize_method(ResizeMethod::First);
    self.points_mid = SpatialGridMap::default().with_resize_method(ResizeMethod::First);
    self.polygons = SpatialGridMap::default().with_resize_method(ResizeMethod::Maximum);
    self.polygons_placement = SpatialGridMap::default().with_resize_method(ResizeMethod::Maximum);
    self.seed_polygon = None;
    self.stage_added_polygon = false;
    self.stages = Vec::new();
  }

  pub fn iter_polygons(&self) -> impl Iterator<Item = &Polygon> {
    self.polygons.iter_values()
  }

  pub fn iter_polygons_placement(&self) -> impl Iterator<Item = &Polygon> {
    self.polygons_placement.iter_values()
  }

  pub fn iter_points_placement(&self) -> impl Iterator<Item = &(f64, f64)> {
    let points_center_iter = self.points_center.iter_points();
    let points_end_iter = self.points_end.iter_points();
    let points_mid_iter = self.points_mid.iter_points();

    points_center_iter
      .chain(points_end_iter)
      .chain(points_mid_iter)
  }

  pub fn build(&mut self, notation: &Notation) -> Result<(), TilingError> {
    self.reset();
    self.apply_path(&notation.path)?;

    if !notation.transforms.list.is_empty() {
      for (index, transform) in notation.transforms.list.iter().enumerate() {
        self.apply_initial_transform(index as u32, transform)?;
      }

      if self.expansion_phases > 0 {
        for _ in 0..self.expansion_phases {
          for (index, transform) in notation.transforms.list.iter().enumerate() {
            self.apply_transform(index as u32, transform)?;
          }
        }
      }

      self.validate_expanded()?;
      self.validate_gaps()?;
      self.validate_vertex_types()?;

      self.convex_hull = ConvexHull::from_line_segments(self.get_line_segment_edges());
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
            let polygon = Polygon::default()
              .with_phase(Phase::Seed)
              .with_shape(seed.shape)
              .with_offset(seed.offset)
              .at_center();

            self.line_segments_by_shape_group.push(BTreeSet::new());
            self.seed_polygon = Some(polygon.clone());
            self.add_polygon(Stage::Placement, polygon)?;

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

            let polygon = Polygon::default()
              .with_shape(*shape)
              .with_phase(Phase::Placement)
              .with_index(shape_counter)
              .with_stage_index(self.stages.len() as u16)
              .on_line_segment(&line_segment.flip(), points_counter - 1);

            self.add_polygon(Stage::Placement, polygon)?;

            shape_counter += 1;
            points_counter += *shape as u8 - 2;

            self.complete_stage(Stage::Placement);
          }
          Node::Separator(Separator::Group) => {
            self.line_segments_by_shape_group.push(BTreeSet::new());
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
  fn add_polygon(&mut self, stage: Stage, polygon: Polygon) -> Result<(), TilingError> {
    if self.polygons.contains(&polygon.centroid.into()) {
      self
        .metrics
        .increment(stage.to_string().as_str(), "polygons_skipped");
      return Ok(());
    }

    let size = polygon.bbox.height().max(polygon.bbox.width());

    self.stage_added_polygon = true;
    self
      .metrics
      .increment(stage.to_string().as_str(), "polygons_added");

    // We add the polygon first so we can see it
    // if there are any errors
    self
      .polygons
      .insert(polygon.centroid.into(), size, polygon.clone());

    if polygon.phase <= Phase::Placement {
      // Store the polygon's center point
      // for looking up origins for transforms
      self.points_center.insert(
        polygon.centroid.into(),
        size,
        PointSequence::default()
          .with_center(polygon.centroid)
          .with_size(polygon.shape.into()),
      );

      // We also store the polygons from the placement phase
      // for convenience as they are the only original polygons,
      // all the other polygons after are transformed copies.
      self
        .polygons_placement
        .insert(polygon.centroid.into(), size, polygon.clone());
    }

    for line_segment in polygon.line_segments.iter() {
      let mid_point = line_segment.mid_point();
      let mid_point_f64: (f64, f64) = mid_point.into();

      if polygon.phase <= Phase::Placement {
        // Store the line segments mid point
        // for looking up origins for transforms
        self.points_mid.insert(
          mid_point_f64,
          line_segment.length(),
          PointSequence::default().with_center(mid_point).with_size(2),
        );

        // Store the polygon's line segments
        // for looking up in the shape placement stage
        self
          .line_segments_by_shape_group
          .last_mut()
          .map(|line_segments| line_segments.insert(*line_segment));
      }

      // Store the line segments for overlap validation.
      self
        .line_segments
        .insert(mid_point_f64, line_segment.length(), *line_segment)
        .increment_counter("count");

      // Check that the line segment is not intersecting with any
      // other line segments around it
      self.validate_overlaps(&polygon, line_segment)?;
      self.update_edge_type(&polygon, line_segment);
      self.update_shape_type(&polygon, line_segment);
    }

    for point in polygon.points.iter() {
      if polygon.phase <= Phase::Placement {
        let point_f64: (f64, f64) = point.into();

        // Store the polygon's end points
        // for looking up origins for transforms
        self
          .points_end
          .insert(point_f64, 1.0, PointSequence::default().with_center(*point));
      }

      self.update_vertex_type(&polygon, point);
    }

    Ok(())
  }

  fn update_vertex_type(&mut self, polygon: &Polygon, point: &Point) {
    if let Some(mut sequence) = self.points_end.get_value_mut(&point.into()) {
      sequence
        .value
        .insert(polygon.centroid, polygon.shape.into());
    }
  }

  fn update_edge_type(&mut self, polygon: &Polygon, line_segment: &LineSegment) {
    let mid_point = line_segment.mid_point();
    let mid_point_f64: (f64, f64) = mid_point.into();

    if let Some(mut sequence) = self.points_mid.get_value_mut(&mid_point_f64) {
      sequence
        .value
        .insert(polygon.centroid, polygon.shape.into());
    }
  }

  fn update_shape_type(&mut self, polygon: &Polygon, line_segment: &LineSegment) {
    let other_polygon = self
      .points_mid
      .get_value(&line_segment.mid_point().into())
      .and_then(|line_segment_sequence| {
        line_segment_sequence.find_where(|entry| entry.point != polygon.centroid)
      })
      .and_then(|entry| self.polygons.get_value(&entry.point.into()).cloned());

    if let Some(other_polygon) = other_polygon {
      self.update_shape_type_for_polygon(polygon, &other_polygon);
      self.update_shape_type_for_polygon(&other_polygon, polygon);
    }
  }

  fn update_shape_type_for_polygon(&mut self, a: &Polygon, b: &Polygon) {
    if let Some(mut sequence) = self.points_center.get_value_mut(&a.centroid.into()) {
      sequence.value.insert(b.centroid, b.shape.into());
    }
  }

  pub fn get_vertex_types(&self) -> SequenceStore {
    self
      .points_end
      .iter_values()
      .filter(|point_sequence| self.vertex_types.matches_exactly(&point_sequence.sequence))
      .map(|point_sequence| point_sequence.sequence)
      .collect::<Vec<_>>()
      .into()
  }

  pub fn get_edge_types(&self) -> SequenceStore {
    self
      .points_mid
      .iter_values()
      .filter(|point_sequence| point_sequence.is_complete())
      .map(|point_sequence| point_sequence.sequence)
      .collect::<Vec<_>>()
      .into()
  }

  pub fn get_shape_types(&self) -> SequenceStore {
    self
      .points_center
      .iter_values()
      .filter(|point_sequence| point_sequence.is_complete())
      .map(|point_sequence| point_sequence.sequence)
      .collect::<Vec<_>>()
      .into()
  }

  fn complete_stage(&mut self, stage: Stage) {
    if self.stage_added_polygon {
      self.stage_added_polygon = false;
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

  pub fn get_nearest_edge_point(&self) -> Option<Point> {
    self
      .get_line_segment_edges()
      .iter_values()
      .flat_map(|line_segment| [line_segment.p1, line_segment.p2])
      .min_by(|a, b| {
        compare_coordinate(
          a.distance_to(&Point::default()),
          b.distance_to(&Point::default()),
        )
      })
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
      .iter()
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
        .map(|point| point.into()),
      OriginType::MidPoint => self
        .points_mid
        .iter_points()
        .nth(origin_index.value as usize)
        .map(|point| point.into()),
      OriginType::EndPoint => self
        .points_end
        .iter_points()
        .nth(origin_index.value as usize)
        .map(|point| point.into()),
    }
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

  pub fn apply_initial_transform(
    &mut self,
    _index: u32, // TODO: This is to support the efficient tiling, if you ever do it
    transform: &Transform,
  ) -> Result<(), TilingError> {
    self.apply_transform(0, transform)
  }

  /// Applies a transform to the tiling, routing
  /// continuous and eccentric transforms to their
  /// respective functions.
  pub fn apply_transform(&mut self, index: u32, transform: &Transform) -> Result<(), TilingError> {
    let metric_key = Stage::Transform(index).to_string();
    self.metrics.start(&metric_key);
    self.metrics.create(validation::Flag::Overlaps.into());

    match transform {
      Transform::Continuous(TransformContinuous { operation, value }) => {
        self.apply_continuous_transform(index, transform, operation, value)?
      }
      Transform::Eccentric(TransformEccentric {
        operation,
        origin_type,
        origin_index,
      }) => {
        self.apply_eccentric_transform(index, transform, operation, origin_type, origin_index)?
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
    index: u32,
    transform: &Transform,
    operation: &Operation,
    value: &TransformValue,
  ) -> Result<(), TilingError> {
    match operation {
      Operation::Reflect => self.apply_continuous_reflect_transform(index, transform, value),
      Operation::Rotate => self.apply_continuous_rotate_transform(index, transform, value),
    }
  }

  /// Applies an eccentric transform to the tiling,
  /// routing the operation to the respective function.
  fn apply_eccentric_transform(
    &mut self,
    index: u32,
    transform: &Transform,
    operation: &Operation,
    origin_type: &OriginType,
    origin_index: &OriginIndex,
  ) -> Result<(), TilingError> {
    match operation {
      Operation::Reflect => {
        self.apply_eccentric_reflect_transform(index, transform, origin_type, origin_index)
      }
      Operation::Rotate => {
        self.apply_eccentric_rotate_transform(index, transform, origin_type, origin_index)
      }
    }
  }

  /// Applies an eccentric reflection transform to the tiling.
  fn apply_continuous_reflect_transform(
    &mut self,
    index: u32,
    _transform: &Transform,
    transform_value: &TransformValue,
  ) -> Result<(), TilingError> {
    for value in transform_value.get_transform_values() {
      let stage_index = self.stages.len() as u16;
      let p1 = Point::at(0.0, 0.0);
      let p2 = Point::at((value - PI * 0.5).cos(), (value - PI * 0.5).sin());
      let line_segment = LineSegment::default().with_start(p1).with_end(p2);

      self
        .polygons
        .to_owned()
        .iter_values()
        .map(|polygon| {
          polygon
            .clone()
            .with_phase(Phase::Transform(index))
            .with_stage_index(stage_index)
            .reflect(&line_segment)
        })
        .try_for_each(|polygon| self.add_polygon(Stage::Transform(index), polygon))?;

      self.complete_stage(Stage::Transform(index));
    }

    Ok(())
  }

  /// Applies an continuous rotation transform to the tiling.
  fn apply_continuous_rotate_transform(
    &mut self,
    index: u32,
    _transform: &Transform,
    transform_value: &TransformValue,
  ) -> Result<(), TilingError> {
    for value in transform_value.get_transform_values() {
      let stage_index = self.stages.len() as u16;

      self
        .polygons
        .to_owned()
        .iter_values()
        .map(|polygon| {
          polygon
            .clone()
            .with_phase(Phase::Transform(index))
            .with_stage_index(stage_index)
            .rotate(value, None)
        })
        .try_for_each(|polygon| self.add_polygon(Stage::Transform(index), polygon))?;

      self.complete_stage(Stage::Transform(index));
    }

    Ok(())
  }

  /// Applies an eccentric reflection transform to the tiling.
  fn apply_eccentric_reflect_transform(
    &mut self,
    index: u32,
    transform: &Transform,
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

    self
      .to_owned()
      .polygons
      .iter_values()
      .map(|polygon| {
        polygon
          .clone()
          .with_phase(Phase::Transform(index))
          .with_stage_index(stage_index)
          .reflect(&line_segment)
      })
      .try_for_each(|polygon| self.add_polygon(Stage::Transform(index), polygon))?;

    self.complete_stage(Stage::Transform(index));

    Ok(())
  }

  /// Applies an eccentric rotation transform to the tiling.
  fn apply_eccentric_rotate_transform(
    &mut self,
    index: u32,
    transform: &Transform,
    origin_type: &OriginType,
    origin_index: &OriginIndex,
  ) -> Result<(), TilingError> {
    let origin = self
      .get_point_by_index_and_type(origin_type, origin_index)
      .ok_or(TilingError::InvalidTransform {
        transform: transform.to_string(),
        reason: "origin point not found".into(),
      })?;

    let stage_index = self.stages.len() as u16;

    self
      .polygons
      .to_owned()
      .iter_values()
      .map(|polygon| {
        polygon
          .clone()
          .with_phase(Phase::Transform(index))
          .with_stage_index(stage_index)
          .rotate(PI, Some(&origin))
      })
      .try_for_each(|polygon| self.add_polygon(Stage::Transform(index), polygon))?;

    self.complete_stage(Stage::Transform(index));

    Ok(())
  }

  fn validate_overlaps(
    &mut self,
    polygon: &Polygon,
    line_segment: &LineSegment,
  ) -> Result<(), TilingError> {
    self.metrics.resume(validation::Flag::Overlaps.into());
    let result = self
      .validator
      .validate_overlaps(self, polygon, line_segment);
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

#[derive(Clone, Debug, Deserialize, Serialize)]
#[typeshare]
#[serde(tag = "type", content = "index")]
pub enum Stage {
  Placement,
  Transform(u32),
}

impl std::fmt::Display for Stage {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match self {
      Stage::Placement => write!(f, "placement"),
      Stage::Transform(index) => write!(f, "transform_{}", index),
    }
  }
}
