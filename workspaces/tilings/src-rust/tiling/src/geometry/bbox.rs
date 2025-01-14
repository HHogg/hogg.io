#[path = "./bbox_tests.rs"]
#[cfg(test)]
mod tests;

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use super::{LineSegment, Point, Polygon};

#[derive(Clone, Copy, Debug, Default, Deserialize, Serialize, PartialEq)]
#[typeshare]
pub struct BBox {
  center: Point,
  width: f32,
  height: f32,
  rotation: f32,
}

impl BBox {
  pub fn from_min_max(min: Point, max: Point) -> Self {
    let min_x = min.x.min(max.x);
    let min_y = min.y.min(max.y);
    let max_x = min.x.max(max.x);
    let max_y = min.y.max(max.y);

    let center = Point::at((min_x + max_x) * 0.5, (min_y + max_y) * 0.5);
    let width = max_x - min_x;
    let height = max_y - min_y;
    let rotation = 0.0;

    Self {
      center,
      width,
      height,
      rotation,
    }
  }

  pub fn with_center(mut self, center: Point) -> Self {
    self.center = center;
    self
  }

  pub fn with_width(mut self, width: f32) -> Self {
    self.width = width;
    self
  }

  pub fn with_height(mut self, height: f32) -> Self {
    self.height = height;
    self
  }

  pub fn with_rotation(mut self, rotation: f32) -> Self {
    self.rotation = rotation;
    self
  }

  pub fn width(&self) -> f32 {
    self.width
  }

  pub fn height(&self) -> f32 {
    self.height
  }

  pub fn min(&self) -> Point {
    let corners: [Point; 4] = self.into();
    let mut min_x = f32::INFINITY;
    let mut min_y = f32::INFINITY;

    for corner in corners.iter() {
      if corner.x < min_x {
        min_x = corner.x;
      }

      if corner.y < min_y {
        min_y = corner.y;
      }
    }

    Point::at(min_x, min_y)
  }

  pub fn max(&self) -> Point {
    let corners: [Point; 4] = self.into();
    let mut max_x = -f32::INFINITY;
    let mut max_y = -f32::INFINITY;

    for corner in corners.iter() {
      if corner.x > max_x {
        max_x = corner.x;
      }

      if corner.y > max_y {
        max_y = corner.y;
      }
    }

    Point::at(max_x, max_y)
  }

  pub fn ratio(&self) -> f32 {
    self.width() / self.height()
  }

  pub fn radius_min(&self) -> f32 {
    self.width().min(self.height()) * 0.5
  }

  pub fn radius_max(&self) -> f32 {
    self.width().max(self.height()) * 0.5
  }

  pub fn centroid(&self) -> Point {
    self.center
  }

  pub fn union(&self, other: &Self) -> Self {
    // Get the min and max points for both bounding boxes
    let self_min = self.min();
    let self_max = self.max();
    let other_min = other.min();
    let other_max = other.max();

    // Calculate the new min and max points
    let union_min = Point::at(self_min.x.min(other_min.x), self_min.y.min(other_min.y));
    let union_max = Point::at(self_max.x.max(other_max.x), self_max.y.max(other_max.y));

    // Create a new BBox from the calculated min and max
    Self::from_min_max(union_min, union_max)
  }

  pub fn translate(&self, x_multiplier: f32, y_multiplier: f32) -> Self {
    let offset = Point::at(self.width() * x_multiplier, self.height() * y_multiplier);

    self.with_center(self.center.clone().translate(&offset))
  }

  pub fn intersects(&self, other: &Self) -> bool {
    let a_line_segments: [LineSegment; 4] = self.into();
    let b_line_segments: [LineSegment; 4] = other.into();

    for a_line_segment in a_line_segments.iter() {
      for b_line_segment in b_line_segments.iter() {
        if a_line_segment.is_intersecting_with_polygon_line_segment(b_line_segment) {
          return true;
        }
      }
    }

    false
  }
}

impl From<&Vec<Point>> for BBox {
  fn from(points: &Vec<Point>) -> Self {
    let mut min_x = f32::INFINITY;
    let mut min_y = f32::INFINITY;
    let mut max_x = -f32::INFINITY;
    let mut max_y = -f32::INFINITY;

    for point in points.iter() {
      if point.x < min_x {
        min_x = point.x;
      }

      if point.y < min_y {
        min_y = point.y;
      }

      if point.x > max_x {
        max_x = point.x;
      }

      if point.y > max_y {
        max_y = point.y;
      }
    }

    let min = Point::at(min_x, min_y);
    let max = Point::at(max_x, max_y);

    Self::from_min_max(min, max)
  }
}

impl From<&Polygon> for BBox {
  fn from(polygon: &Polygon) -> Self {
    (&polygon.points).into()
  }
}

impl From<&BBox> for [Point; 4] {
  fn from(bbox: &BBox) -> Self {
    let top_left = Point::at(
      bbox.center.x - bbox.width * 0.5,
      bbox.center.y - bbox.height * 0.5,
    )
    .rotate(bbox.rotation, Some(&bbox.center));

    let top_right = Point::at(
      bbox.center.x + bbox.width * 0.5,
      bbox.center.y - bbox.height * 0.5,
    )
    .rotate(bbox.rotation, Some(&bbox.center));

    let bottom_right = Point::at(
      bbox.center.x + bbox.width * 0.5,
      bbox.center.y + bbox.height * 0.5,
    )
    .rotate(bbox.rotation, Some(&bbox.center));

    let bottom_left = Point::at(
      bbox.center.x - bbox.width * 0.5,
      bbox.center.y + bbox.height * 0.5,
    )
    .rotate(bbox.rotation, Some(&bbox.center));

    [top_left, top_right, bottom_right, bottom_left]
  }
}

impl From<&BBox> for [LineSegment; 4] {
  fn from(bbox: &BBox) -> Self {
    let [top_left, top_right, bottom_right, bottom_left]: [Point; 4] = bbox.into();

    [
      LineSegment::default()
        .with_start(top_left)
        .with_end(top_right),
      LineSegment::default()
        .with_start(top_right)
        .with_end(bottom_right),
      LineSegment::default()
        .with_start(bottom_right)
        .with_end(bottom_left),
      LineSegment::default()
        .with_start(bottom_left)
        .with_end(top_left),
    ]
  }
}
