use std::f64::consts::PI;

use tiling::geometry::BBox;

use super::{Chevron, Draw, LineSegment, Style};
use crate::canvas::collision::Theia;
use crate::canvas::Scale;
use crate::Error;

#[derive(Clone, Debug, Default)]
pub struct Arrow {
  line_segment: tiling::geometry::LineSegment,
  style: Style,
}

impl Arrow {
  pub fn with_line_segment(mut self, line_segment: tiling::geometry::LineSegment) -> Self {
    self.line_segment = line_segment;
    self
  }

  pub fn with_style(mut self, style: Style) -> Self {
    self.style = style;
    self
  }

  fn get_chevron(&self, scale: &Scale) -> Chevron {
    let direction = self.line_segment.p2.radian_to(&self.line_segment.p1) - PI * 0.5;
    let point = self.line_segment.p2;

    Chevron::default()
      .with_point(point)
      .with_direction(direction)
      .with_style(self.style.set_line_dash(scale, None))
  }

  fn get_line_segment(&self, scale: &Scale) -> LineSegment {
    LineSegment::default()
      .with_points(self.line_segment.into())
      .with_extend_start(false)
      .with_extend_end(false)
      .with_style(self.style.set_line_dash(scale, None))
  }
}

impl Draw for Arrow {
  fn style(&self) -> &Style {
    &self.style
  }

  fn bbox(
    &self,
    context: &web_sys::OffscreenCanvasRenderingContext2d,
    canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
  ) -> BBox {
    let chevron = self
      .get_chevron(scale)
      .bbox(context, canvas_bbox, content_bbox, scale);

    let line_segment = self
      .get_line_segment(scale)
      .bbox(context, canvas_bbox, content_bbox, scale);

    line_segment.union(&chevron)
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
      .draw(context, canvas_bbox, content_bbox, scale, theia)?;

    self
      .get_chevron(scale)
      .draw(context, canvas_bbox, content_bbox, scale, theia)?;

    Ok(())
  }
}

impl Eq for Arrow {}

impl PartialEq for Arrow {
  fn eq(&self, other: &Self) -> bool {
    self.line_segment == other.line_segment
  }
}
