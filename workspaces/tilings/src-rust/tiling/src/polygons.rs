use std::collections::{BTreeSet, HashMap, HashSet};
use std::f64::consts::PI;

use serde::Serialize;
use typeshare::typeshare;

use crate::classification::{EdgeTypeStore, ShapeTypeStore, VertexTypeStore};
use crate::{
  path,
  BBox,
  LineSegment,
  Operation,
  OriginIndex,
  OriginType,
  Path,
  Phase,
  Point,
  Polygon,
  Separator,
  Shape,
  TilingError,
  Transform,
  TransformContinuous,
  TransformEccentric,
  TransformValue,
  Transforms,
  ValidationFlag,
  Validator,
};

#[derive(Clone, Debug, Default, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Polygons {
  pub bbox: BBox,
  pub scale: u8,
  pub stages: u16,
  pub stage_added_polygon: bool,

  pub edge_type_store: EdgeTypeStore,
  pub shape_type_store: ShapeTypeStore,
  pub vertex_type_store: VertexTypeStore,

  #[serde(skip)]
  pub line_segments_by_mid_point: HashMap<Point, LineSegment>,
  #[serde(skip)]
  pub line_segments_by_shape_group: Vec<BTreeSet<LineSegment>>,
  #[serde(skip)]
  pub points_center: BTreeSet<Point>,
  #[serde(skip)]
  pub points_end: BTreeSet<Point>,
  #[serde(skip)]
  pub points_mid: BTreeSet<Point>,
  #[serde(skip)]
  pub polygons: HashSet<Polygon>,
  #[serde(skip)]
  pub seed_polygon: Option<Polygon>,
  #[serde(skip)]
  pub validator: Validator,
}

impl Polygons {
  /// Setting this skips the validation that happens as
  /// the tiling is being built up. This should only be
  /// used when the notation provided is known to be valid,
  /// and can be used to speed up the process of building.
  pub fn with_validations(&mut self, validations: Option<Vec<ValidationFlag>>) {
    self.validator = validations.into();
  }

  pub fn with_scale(&mut self, scale: u8) {
    self.scale = scale;
  }

  // TODO: There's an improvement that can be made here to not
  // clear out everything when the path or transforms change. We
  // can commit sections and then remove those commits as parts of the
  // notation changes. This will allow the next() functionality to be
  // much quicker by not needing to recalculate shapes/positions and validations.
  pub fn reset(&mut self) {
    self.bbox = BBox::default();
    self.stages = 0;
    self.stage_added_polygon = false;

    self.edge_type_store = EdgeTypeStore::default();
    self.shape_type_store = ShapeTypeStore::default();
    self.vertex_type_store = VertexTypeStore::default();

    self.line_segments_by_mid_point = HashMap::new();
    self.line_segments_by_shape_group = Vec::new();
    self.points_center = BTreeSet::new();
    self.points_end = BTreeSet::new();
    self.points_mid = BTreeSet::new();
    self.polygons = HashSet::new();
    self.seed_polygon = None;
  }

  pub fn iter(&self) -> impl Iterator<Item = &Polygon> {
    self.polygons.iter()
  }

  pub fn build(
    &mut self,
    path: &Path,
    transforms: &Transforms,
    expansion_phases: u8,
  ) -> Result<(), TilingError> {
    self.reset();
    self.apply_path(path)?;
    self.validator.validate_overlaps(self)?;

    if !transforms.list.is_empty() {
      for (index, transform) in transforms.list.iter().enumerate() {
        self.apply_initial_transform(index, transform)?;
        self.validator.validate_overlaps(self)?;
      }

      if expansion_phases > 0 {
        for _ in 0..expansion_phases {
          for transform in transforms.list.iter() {
            self.apply_transform(transform)?;
            self.validator.validate_overlaps(self)?;
          }
        }

        // Once all the polygons have been added and the shape
        // types have been calculated. We can annotate the polygons
        // with their shape types.
        self.polygons = self
          .polygons
          .drain()
          .map(|mut polygon| {
            self.shape_type_store.annotate_polygon(&mut polygon);
            polygon
          })
          .collect();

        self.validator.validate_vertex_types(self)?;
        // self.validator.validate_edge_types(self)?;
        self.validator.validate_gaps(self)?;
        self.validator.validate_expanded(self)?;
      }
    }

    Ok(())
  }

  ///
  pub fn apply_path(&mut self, path: &Path) -> Result<(), TilingError> {
    // Keep track of the number of line segments that need to be
    // skipped as we go around placing shapes.
    let mut skip = 0;

    // Keep track of the number of group separators we encounter
    let mut group_counter: usize = 0;

    // Keep track of the number of shapes we encounter
    let mut shape_counter = 0;

    path
      .nodes
      .iter()
      .try_for_each::<_, Result<(), TilingError>>(|node| {
        match node {
          path::Node::Seed(seed) => {
            let polygon = Polygon::default()
              .with_phase(Phase::Seed)
              .with_shape(seed.shape)
              .with_offset(seed.offset)
              .at_center(self.scale);

            self.line_segments_by_shape_group.push(BTreeSet::new());
            self.seed_polygon = Some(polygon.clone());
            self.add_polygon(polygon)?;
            shape_counter += 1;
            self.next_stage();
          }
          path::Node::Shape(Shape::Skip) => {
            skip += 1;
          }
          path::Node::Shape(shape) => {
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
              .with_stage_index(self.stages)
              .with_notation_index(shape_counter)
              .on_line_segment(&line_segment.flip());

            self.add_polygon(polygon)?;
            shape_counter += 1;
            self.next_stage();
          }
          path::Node::Separator(Separator::Group) => {
            self.line_segments_by_shape_group.push(BTreeSet::new());
            group_counter += 1;
            skip = 0;
          }
          path::Node::Separator(Separator::Shape) => {}
          path::Node::Separator(Separator::Transform) => {
            Err(TilingError::Application {
              reason: "a transform separator made it's way into the Path".into(),
            })?;
          }
        }

        Ok(())
      })?;

    Ok(())
  }

  ///
  fn next_stage(&mut self) {
    if self.stage_added_polygon {
      self.stages += 1;
      self.stage_added_polygon = false;
    }
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
      .filter(|line_segment| self.edge_type_store.is_available(line_segment))
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
      OriginType::CenterPoint => self.points_center.len(),
      OriginType::MidPoint => self.points_mid.len(),
      OriginType::EndPoint => self.points_end.len(),
    }
  }

  /// Returns a transform origin point by index and type
  pub fn get_point_by_index_and_type(
    &self,
    origin_type: &OriginType,
    origin_index: &OriginIndex,
  ) -> Option<&Point> {
    match origin_type {
      OriginType::CenterPoint => self.points_center.iter().nth(origin_index.value as usize),
      OriginType::MidPoint => self.points_mid.iter().nth(origin_index.value as usize),
      OriginType::EndPoint => self.points_end.iter().nth(origin_index.value as usize),
    }
  }

  ///
  pub fn get_reflection_line(
    &self,
    origin_index: &OriginIndex,
    origin_type: &OriginType,
  ) -> Option<LineSegment> {
    self
      .get_point_by_index_and_type(origin_type, origin_index)
      .and_then(|origin| {
        match origin_type {
          OriginType::MidPoint => self.line_segments_by_mid_point.get(origin).copied(),
          _ => {
            if origin.eq(&Point::default()) {
              return Some(
                LineSegment::default()
                  .with_start(Point::default().with_xy(-1.0, 0.0))
                  .with_end(Point::default().with_xy(1.0, 0.0)),
              );
            }

            Some(
              LineSegment::default()
                .with_start(Point::default())
                .with_end(origin.multiply(2.0))
                .rotate(PI * 0.5, None),
            )
          }
        }
      })
  }

  /// Inserts a polygon into the tiling. If the polygon that occupies the
  /// same space already exists then it is not added.
  ///
  /// Once it's added the tiling's bbox is extended to include the polygon's
  /// bbox. This function is also responsible for storing information for
  /// various use cases
  ///
  /// - Extending the tilings bbox
  /// - Building up the transform origins
  /// - Building up the shape arrangements
  /// - Building up the line segments for the placement phase
  /// - Recording the number of times a line segment is used for the gaps check
  fn add_polygon(&mut self, mut polygon: Polygon) -> Result<(), TilingError> {
    if self.polygons.contains(&polygon) {
      return Ok(());
    }

    self.stage_added_polygon = true;

    // Extend the tilings bbox to include the polygon's bbox
    self.bbox = self.bbox.union(&polygon.bbox);

    // Store the polygon's points
    // for looking up origins for transforms
    if polygon.phase <= Phase::Placement {
      self.points_center.insert(polygon.centroid);
    }

    for point in polygon.points.iter() {
      // Store the polygon's points
      // for looking up origins for transforms
      if polygon.phase <= Phase::Placement {
        self.points_end.insert(*point);
      }
    }

    for line_segment in polygon.line_segments.iter() {
      if polygon.phase <= Phase::Placement {
        // Store the polygon's line segments
        // for looking up in the shape placement stage
        self
          .line_segments_by_shape_group
          .last_mut()
          .map(|line_segments| line_segments.insert(*line_segment));

        // Store the polygon's line segments
        // for looking up reflection lines.
        self
          .line_segments_by_mid_point
          .insert(line_segment.mid_point(), *line_segment);

        // Store the line segments mid point
        // for looking up origins for transforms
        self.points_mid.insert(line_segment.mid_point());
      }
    }

    // Add the polygon to the vertex type store
    if let Err(err) = self.vertex_type_store.add_polygon(&mut polygon) {
      if self.validator.is_validating_vertex_types() {
        return Err(err);
      }
    }

    // Add the polygon to the edge type store
    self.edge_type_store.add_polygon(&polygon)?;

    // Add the polygon to the shape type store
    self
      .shape_type_store
      .add_polygon(&polygon, &mut self.edge_type_store)?;

    // We insert down here because the vertex, edge and shape type stores
    // need to be able to annotate the polygon and its elements
    self.polygons.insert(polygon);

    Ok(())
  }

  pub fn apply_initial_transform(
    &mut self,
    _index: usize, // TODO: This is to support the efficient tiling, if you ever do it
    transform: &Transform,
  ) -> Result<(), TilingError> {
    self.apply_transform(transform)
  }

  /// Applies a transform to the tiling, routing
  /// continuous and eccentric transforms to their
  /// respective functions.
  pub fn apply_transform(&mut self, transform: &Transform) -> Result<(), TilingError> {
    match transform {
      Transform::Continuous(TransformContinuous { operation, value }) => {
        self.apply_continuous_transform(transform, operation, value)
      }
      Transform::Eccentric(TransformEccentric {
        operation,
        origin_type,
        origin_index,
      }) => self.apply_eccentric_transform(transform, operation, origin_type, origin_index),
    }
  }

  /// Applies a continuous transform to the tiling,
  /// routing the operation to the respective function.
  fn apply_continuous_transform(
    &mut self,
    transform: &Transform,
    operation: &Operation,
    value: &TransformValue,
  ) -> Result<(), TilingError> {
    match operation {
      Operation::Reflect => self.apply_continuous_reflect_transform(transform, value),
      Operation::Rotate => self.apply_continuous_rotate_transform(transform, value),
    }
  }

  /// Applies an eccentric transform to the tiling,
  /// routing the operation to the respective function.
  fn apply_eccentric_transform(
    &mut self,
    transform: &Transform,
    operation: &Operation,
    origin_type: &OriginType,
    origin_index: &OriginIndex,
  ) -> Result<(), TilingError> {
    match operation {
      Operation::Reflect => {
        self.apply_eccentric_reflect_transform(transform, origin_type, origin_index)
      }
      Operation::Rotate => {
        self.apply_eccentric_rotate_transform(transform, origin_type, origin_index)
      }
    }
  }

  /// Applies an eccentric reflection transform to the tiling.
  ///
  /// TODO
  fn apply_continuous_reflect_transform(
    &mut self,
    _transform: &Transform,
    transform_value: &TransformValue,
  ) -> Result<(), TilingError> {
    for value in transform_value.get_transform_values() {
      let stage_index = self.stages;
      let p1 = Point::default().with_xy(0.0, 0.0);
      let p2 = Point::default().with_xy((value - PI * 0.5).cos(), (value - PI * 0.5).sin());
      let line_segment = LineSegment::default().with_start(p1).with_end(p2);

      self
        .polygons
        .to_owned()
        .iter()
        .map(|polygon| {
          polygon
            .clone()
            .with_phase(Phase::Transform)
            .with_stage_index(stage_index)
            .reflect(&line_segment)
        })
        .try_for_each(|polygon| self.add_polygon(polygon))?;

      self.next_stage();
    }

    Ok(())
  }

  /// Applies an continuous rotation transform to the tiling.
  ///
  /// TODO
  fn apply_continuous_rotate_transform(
    &mut self,
    _transform: &Transform,
    transform_value: &TransformValue,
  ) -> Result<(), TilingError> {
    for value in transform_value.get_transform_values() {
      let stage_index = self.stages;

      self
        .polygons
        .to_owned()
        .iter()
        .map(|polygon| {
          polygon
            .clone()
            .with_phase(Phase::Transform)
            .with_stage_index(stage_index)
            .rotate(value, None)
        })
        .try_for_each(|polygon| self.add_polygon(polygon))?;

      self.next_stage();
    }

    Ok(())
  }

  /// Applies an eccentric reflection transform to the tiling.
  ///
  /// TODO
  fn apply_eccentric_reflect_transform(
    &mut self,
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

    let stage_index = self.stages;

    self
      .polygons
      .to_owned()
      .iter()
      .map(|polygon| {
        polygon
          .clone()
          .with_phase(Phase::Transform)
          .with_stage_index(stage_index)
          .reflect(&line_segment)
      })
      .try_for_each(|polygon| self.add_polygon(polygon))?;

    Ok(())
  }

  /// Applies an eccentric rotation transform to the tiling.
  ///
  /// TODO
  fn apply_eccentric_rotate_transform(
    &mut self,
    transform: &Transform,
    origin_type: &OriginType,
    origin_index: &OriginIndex,
  ) -> Result<(), TilingError> {
    let origin = *self
      .get_point_by_index_and_type(origin_type, origin_index)
      .ok_or(TilingError::InvalidTransform {
        transform: transform.to_string(),
        reason: "origin point not found".into(),
      })?;

    let stage_index = self.stages;

    self
      .polygons
      .to_owned()
      .iter()
      .map(|polygon| {
        polygon
          .clone()
          .with_phase(Phase::Transform)
          .with_stage_index(stage_index)
          .rotate(PI, Some(&origin))
      })
      .try_for_each(|polygon| self.add_polygon(polygon))?;

    self.next_stage();

    Ok(())
  }
}
