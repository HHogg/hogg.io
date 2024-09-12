use std::f64::consts::PI;

use tiling::geometry::{BBox, Point};

use super::{Draw, LineSegment, Style};
use crate::canvas::collision::Theia;
use crate::canvas::Scale;
use crate::Error;

#[derive(Clone, Debug, Default)]
pub struct Chevron {
  point: Point,
  direction: f64,
  style: Style,
}

impl Chevron {
  pub fn with_point(mut self, point: Point) -> Self {
    self.point = point;
    self
  }

  pub fn with_direction(mut self, direction: f64) -> Self {
    self.direction = direction;
    self
  }

  pub fn with_style(mut self, style: Style) -> Self {
    self.style = style;
    self
  }

  fn get_points(&self, scale: &Scale) -> Vec<Point> {
    let size = self.style.get_chevron_size(scale);

    let point_1 = Point::at(self.point.x - size, self.point.y - size)
      .rotate(self.direction - PI * 0.5, Some(&self.point));
    let point_2 = Point::at(self.point.x, self.point.y);
    let point_3 = Point::at(self.point.x + size, self.point.y - size)
      .rotate(self.direction - PI * 0.5, Some(&self.point));

    vec![point_1, point_2, point_3]
  }

  fn get_line_segment(&self, scale: &Scale) -> LineSegment {
    LineSegment::default()
      .with_points(self.get_points(scale))
      .with_extend_start(false)
      .with_extend_end(false)
      .with_style(self.style.set_line_dash(scale, None))
  }
}

impl Draw for Chevron {
  fn bbox(
    &self,
    context: &web_sys::OffscreenCanvasRenderingContext2d,
    canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
  ) -> BBox {
    self
      .get_line_segment(scale)
      .bbox(context, canvas_bbox, content_bbox, scale)
  }

  fn component(&self) -> super::Component {
    self.clone().into()
  }

  fn draw(
    &self,
    context: &web_sys::OffscreenCanvasRenderingContext2d,
    canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
    theia: &mut Theia,
  ) -> Result<(), Error> {
    self
      .get_line_segment(scale)
      .draw(context, canvas_bbox, content_bbox, scale, theia)
  }

  fn style(&self) -> &Style {
    &self.style
  }
}
