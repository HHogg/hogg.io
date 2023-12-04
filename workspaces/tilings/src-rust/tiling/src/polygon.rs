#[path = "./polygon_tests.rs"]
#[cfg(test)]
mod tests;

use std::f64::consts::PI;
use std::hash::{Hash, Hasher};
use std::str::FromStr;

use serde::Serialize;
use typeshare::typeshare;

use super::{BBox, LineSegment, Phase, Point, Shape, TilingError};
use crate::{math, Offset};

#[derive(Clone, Debug, Default, Serialize)]
#[typeshare]
pub struct Polygon {
  pub bbox: BBox,
  pub centroid: Point,
  pub line_segments: Vec<LineSegment>,
  pub notation_index: u16,
  pub offset: Offset,
  pub phase: Phase,
  pub points: Vec<Point>,
  pub shape: Shape,
  pub shape_type: Option<u8>,
  pub stage_index: u16,
}

impl Polygon {
  pub fn with_points(mut self, points: Vec<Point>) -> Self {
    self.points = points;
    self.centroid = self.points.clone().into();
    self.bbox = self.points.clone().into();
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

  pub fn with_notation_index(mut self, notation_index: u16) -> Self {
    self.notation_index = notation_index as u16;
    self
  }

  pub fn with_stage_index(mut self, stage_index: u16) -> Self {
    self.stage_index = stage_index as u16;
    self
  }

  pub fn with_phase(mut self, phase: Phase) -> Self {
    self.phase = phase;
    self
  }

  pub fn at_center(self, scale: u8) -> Self {
    let scale = scale.max(1) as f64;
    let sides = self.shape.to_u8();
    let radians = self.shape.get_internal_angle();

    let mut points = Vec::new();

    for index in 0..sides {
      let x = (radians * index as f64).cos();
      let y = (radians * index as f64).sin();

      let mut point = Point::default().with_xy(x, y);

      match self.shape {
        Shape::Triangle => {
          point = point.rotate(PI / 6.0, None);
        }
        Shape::Square | Shape::Octagon | Shape::Dodecagon => {
          point = point.rotate(PI / (sides as f64), None);
        }
        _ => {}
      }

      points.push(point.scale(scale));
    }

    let polygon = self.with_points(points);

    match (polygon.shape, polygon.offset) {
      (Shape::Triangle, Offset::Center) => {
        let max_x = polygon.bbox.max.x;
        let max_y = polygon.bbox.max.y;

        polygon
          .translate(Point::default().with_xy(max_x * -1.0, max_y * -1.0))
          .rotate(PI / 2.0, None)
      }
      (_, Offset::Center) => polygon,
      // (_, Offset::Left) => {
      //   let max_x = polygon.bbox.max.x;
      //   let max_y = polygon.bbox.max.y;
      //   polygon.translate(Point::default().with_xy(max_x, 0.0))
      // }
    }
  }

  pub fn on_line_segment(self, line_segment: &LineSegment) -> Self {
    let sides = self.shape.to_u8();
    let length = line_segment.p1.distance_to(&line_segment.p2);
    let shape_radians = self.shape.get_internal_angle();
    let mut theta = line_segment.p1.radian_to(&line_segment.p2) + shape_radians + PI * 0.5;

    let mut points = vec![line_segment.p1, line_segment.p2];
    points.reserve_exact(sides as usize);

    for i in 2..sides {
      let previous = &points[(i - 1) as usize];
      let x = previous.x + length * theta.cos();
      let y = previous.y + length * theta.sin();

      points.push(Point::default().with_xy(x, y));

      theta += shape_radians;
    }

    self.with_points(points)
  }

  fn generate_line_segments(&mut self) {
    self.points.sort_by(|v1, v2| {
      let theta1 = v1.radian_to(&self.centroid);
      let theta2 = v2.radian_to(&self.centroid);

      math::compare_radians(theta1, theta2)
    });

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

  pub fn contains_point(&self, point: &Point) -> bool {
    for v in self.points.iter() {
      if v == point {
        return false;
      }
    }

    let mut delta = 0;
    for line_segment in self.line_segments.iter() {
      match line_segment.get_point_delta(point) {
        d if delta == 1 && d == -1 => return false,
        d if delta == -1 && d == 1 => return false,
        d if d == 0 => return false,
        d => delta = d,
      }
    }

    true
  }

  /// Returns true if the shape intersects with another shape.
  ///
  /// The first check is to see if the distance between the two
  /// shapes is greater than the sum of their radii.
  ///
  /// If the distance is less than the sum of the radii, then
  /// we check to see if any of the points of the other shape
  /// are contained within the shape.
  ///
  /// If the other shape is not contained within the shape, then
  /// we check to see if any of the line segments of the other
  /// shape intersect with any of the line segments of the shape.
  ///
  /// If the other shape is not contained within the shape and
  /// the line segments do not intersect, then the shapes do not
  /// intersect.
  pub fn intersects(&self, other: &Self) -> bool {
    let dist = self.centroid.distance_to(&other.centroid);

    if dist > self.bbox.radius() + other.bbox.radius() {
      return false;
    }

    for point in other.points.iter() {
      if self.contains_point(point) {
        return true;
      }
    }

    for line_segment1 in other.line_segments.iter() {
      for line_segment2 in self.line_segments.iter() {
        if line_segment1.intersects_line_segment(line_segment2) {
          return true;
        }
      }
    }

    false
  }

  ///
  pub fn reflect(self, line_segment: &LineSegment) -> Self {
    let mut points = vec![];
    points.reserve_exact(self.points.len());

    for point in &self.points {
      points.push(point.reflect(&line_segment.p1, &line_segment.p2));
    }

    self.with_points(points)
  }

  ///
  pub fn rotate(self, radians: f64, origin: Option<&Point>) -> Self {
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

impl FromStr for Polygon {
  type Err = TilingError;

  fn from_str(s: &str) -> Result<Self, Self::Err> {
    Ok(Self::default().with_shape(Shape::from_str(s)?))
  }
}

// Shape + Points
impl Hash for Polygon {
  fn hash<H: Hasher>(&self, state: &mut H) {
    self.shape.hash(state);

    for point in self.points.iter() {
      point.hash(state);
    }
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
