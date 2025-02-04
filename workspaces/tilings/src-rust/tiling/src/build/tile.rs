#[path = "./tile_tests.rs"]
#[cfg(test)]
mod tests;

use std::f32::consts::PI;

use hogg_geometry::{LineSegment, Point};
use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use crate::build;
use crate::notation::{Offset, Shape};

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[typeshare]
#[serde(rename_all = "camelCase")]
pub struct Tile {
  pub geometry: hogg_geometry::Polygon,
  pub index: u16,
  pub offset: Offset,
  pub shape: Shape,
  pub stage: build::Stage,
  pub stage_index: u16,
}

impl Tile {
  pub fn with_points(mut self, points: Vec<Point>) -> Self {
    self.geometry = hogg_geometry::Polygon::from_points(points);
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

    let mut polygon = self.with_points(points);

    match (polygon.shape, polygon.offset) {
      (Shape::Triangle, Offset::Center) => {
        let max_x = polygon.geometry.bbox.max().x;
        let max_y = polygon.geometry.bbox.max().y;

        polygon.geometry = polygon
          .geometry
          .translate(Point::at(max_x * -1.0, max_y * -1.0))
          .rotate(PI * 0.5, None);

        polygon
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

  pub fn reflect(mut self, line_segment: &LineSegment) -> Self {
    self.geometry = self.geometry.reflect(line_segment);
    self
  }

  pub fn rotate(mut self, radians: f32, origin: Option<&Point>) -> Self {
    self.geometry = self.geometry.rotate(radians, origin);
    self
  }
}

impl Eq for Tile {}

impl PartialEq for Tile {
  fn eq(&self, other: &Self) -> bool {
    if self.shape != other.shape {
      return false;
    }

    self.geometry == other.geometry
  }
}
