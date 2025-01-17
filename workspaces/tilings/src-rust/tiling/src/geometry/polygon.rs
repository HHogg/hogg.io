#[path = "./polygon_tests.rs"]
#[cfg(test)]
mod tests;

use std::cmp::Ordering;
use std::f32::consts::PI;

use serde::{Deserialize, Serialize};
use spatial_grid_map::utils::compare_coordinate;
use typeshare::typeshare;

use super::point::sort_points_around_origin;
use super::{BBox, LineSegment, Point};
use crate::build;
use crate::notation::{Offset, Shape};

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[typeshare]
#[serde(rename_all = "camelCase")]
pub struct Polygon {
  pub bbox: BBox,
  pub centroid: Point,
  pub index: u16,
  pub line_segments: Vec<LineSegment>,
  pub offset: Offset,
  pub points: Vec<Point>,
  pub shape: Shape,
  pub stage: build::Stage,
  pub stage_index: u16,
}

impl Polygon {
  pub fn with_points(mut self, points: Vec<Point>) -> Self {
    self.points = points;
    self.centroid = (&self.points).into();
    self.bbox = (&self).into();
    self.generate_line_segments();
    self
  }

  pub fn with_shape(mut self, shape: Shape) -> Self {
    self.shape = shape;
    self
  }

  pub fn with_offset(mut self, offset: Offset) -> Self {
    self.offset = offset;
    self
  }

  pub fn with_index(mut self, index: u16) -> Self {
    self.index = index;
    self
  }

  pub fn with_stage_index(mut self, stage_index: u16) -> Self {
    self.stage_index = stage_index;
    self
  }

  pub fn with_stage(mut self, stage: build::Stage) -> Self {
    self.stage = stage;
    self
  }

  pub fn at_center(self) -> Self {
    let sides = self.shape as u8;
    let radians = self.shape.get_internal_angle();

    let mut points = Vec::new();

    for index in 0..sides {
      let x = (radians * index as f32).cos();
      let y = (radians * index as f32).sin();

      let mut point = Point::at(x, y).with_index(index);

      match self.shape {
        Shape::Triangle => {
          point = point.rotate(PI / 6.0, None);
        }
        Shape::Square | Shape::Octagon | Shape::Dodecagon => {
          point = point.rotate(PI / (sides as f32), None);
        }
        _ => {}
      }

      points.push(point);
    }

    let polygon = self.with_points(points);

    match (polygon.shape, polygon.offset) {
      (Shape::Triangle, Offset::Center) => {
        let max_x = polygon.bbox.max().x;
        let max_y = polygon.bbox.max().y;

        polygon
          .translate(Point::at(max_x * -1.0, max_y * -1.0))
          .rotate(PI * 0.5, None)
      }
      (_, Offset::Center) => polygon,
    }
  }

  pub fn on_line_segment(self, line_segment: &LineSegment, point_index_offset: u8) -> Self {
    let sides = self.shape as u8;
    let length = line_segment.start.distance_to(&line_segment.end);
    let shape_radians = self.shape.get_internal_angle();
    let mut theta = line_segment.start.radian_to(&line_segment.end) + shape_radians + PI * 0.5;

    let mut points = vec![line_segment.start, line_segment.end];
    points.reserve_exact(sides as usize);

    for i in 2..sides {
      let previous = &points[(i - 1) as usize];
      let x = previous.x + length * theta.cos();
      let y = previous.y + length * theta.sin();

      points.push(Point::at(x, y).with_index(point_index_offset + i - 1));

      theta += shape_radians;
    }

    self.with_points(points)
  }

  fn generate_line_segments(&mut self) {
    sort_points_around_origin(&mut self.points, &self.centroid);

    let mut line_segments = Vec::new();

    for index in 0..self.points.len() {
      let next_index = (index + 1) % self.points.len();

      line_segments.push(
        LineSegment::default()
          .with_start(self.points[index])
          .with_end(self.points[next_index]),
      );
    }

    self.line_segments = line_segments;
  }

  fn get_apothem(&self) -> f32 {
    let sides = self.shape as u8 as f32;
    let side_length = self.line_segments[0].length();
    let radius = side_length / (2.0 * (PI / sides).sin());

    radius * (PI / sides).cos()
  }

  /// Returns true if the shape intersects with another shape.
  pub fn intersects(&self, other: &Self) -> bool {
    let self_apothem = self.get_apothem();
    let other_apothem = other.get_apothem();
    let dist = self.centroid.distance_to(&other.centroid);

    match compare_coordinate(dist, self_apothem + other_apothem) {
      Ordering::Greater => false,
      Ordering::Equal => false,
      Ordering::Less => true,
    }
  }

  pub fn reflect(self, line_segment: &LineSegment) -> Self {
    let mut points = vec![];
    points.reserve_exact(self.points.len());

    for point in &self.points {
      points.push(point.reflect(&line_segment.start, &line_segment.end));
    }

    self.with_points(points)
  }

  pub fn rotate(self, radians: f32, origin: Option<&Point>) -> Self {
    let mut points = vec![];
    points.reserve_exact(self.points.len());

    for point in &self.points {
      points.push(point.rotate(radians, origin));
    }

    self.with_points(points)
  }

  pub fn translate(self, point: Point) -> Self {
    let mut points = vec![];
    points.reserve_exact(self.points.len());

    for p in &self.points {
      points.push(p.translate(&point));
    }

    self.with_points(points)
  }
}

impl Eq for Polygon {}

impl PartialEq for Polygon {
  fn eq(&self, other: &Self) -> bool {
    if self.shape != other.shape {
      return false;
    }

    if self.points.len() != other.points.len() {
      return false;
    }

    for point in &self.points {
      if !other.points.contains(point) {
        return false;
      }
    }

    true
  }
}
