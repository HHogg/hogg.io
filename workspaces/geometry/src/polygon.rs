use std::cmp::Ordering;
use std::f32::consts::PI;

use serde::{Deserialize, Serialize};
use spatial_grid_map::utils::compare_coordinate;
use typeshare::typeshare;

use super::point::sort_points_around_origin;
use super::{BBox, LineSegment, Point};

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[typeshare]
#[serde(rename_all = "camelCase")]
pub struct Polygon {
  pub bbox: BBox,
  pub centroid: Point,
  pub line_segments: Vec<LineSegment>,
  pub points: Vec<Point>,
}

impl Polygon {
  pub fn from_points(points: Vec<Point>) -> Self {
    let mut polygon = Self::default();

    polygon.points = points;
    polygon.centroid = (&polygon.points).into();
    polygon.bbox = (&polygon).into();
    polygon.generate_line_segments();

    polygon
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
    let sides = self.points.len() as f32;
    let side_length = self.line_segments[0].length();
    let radius = side_length / (2.0 * (PI / sides).sin());

    radius * (PI / sides).cos()
  }

  /// Returns true if the shape intersects with another shape.
  /// TODO: Can this be removed? Is this actually needed?
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

    Self::from_points(points)
  }

  pub fn rotate(self, radians: f32, origin: Option<&Point>) -> Self {
    let mut points = vec![];
    points.reserve_exact(self.points.len());

    for point in &self.points {
      points.push(point.rotate(radians, origin));
    }

    Self::from_points(points)
  }

  pub fn translate(self, point: Point) -> Self {
    let mut points = vec![];
    points.reserve_exact(self.points.len());

    for p in &self.points {
      points.push(p.translate(&point));
    }

    Self::from_points(points)
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
