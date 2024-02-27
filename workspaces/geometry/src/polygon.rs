#[path = "./polygon_tests.rs"]
#[cfg(test)]
mod tests;

use std::hash::{Hash, Hasher};

use serde::Serialize;
use typeshare::typeshare;

use super::{BBox, LineSegment, Point};
use crate::math;

#[derive(Clone, Debug, Default, Serialize)]
#[typeshare]
pub struct Polygon {
  pub bbox: BBox,
  pub centroid: Point,
  pub line_segments: Vec<LineSegment>,
  pub points: Vec<Point>,
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

// Shape + Points
impl Hash for Polygon {
  fn hash<H: Hasher>(&self, state: &mut H) {
    for point in self.points.iter() {
      point.hash(state);
    }
  }
}

impl Eq for Polygon {}

impl PartialEq for Polygon {
  fn eq(&self, other: &Self) -> bool {
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
