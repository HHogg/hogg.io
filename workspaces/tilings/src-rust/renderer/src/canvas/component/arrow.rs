use std::f64::consts::PI;

use tiling::geometry::BBox;

use super::{Chevron, Component, Draw, LineSegment, Style};
use crate::canvas::collision::Theia;
use crate::canvas::Scale;
use crate::Error;

#[derive(Clone)]
pub struct Arrow {
  pub line_segment: tiling::geometry::LineSegment,
  pub style: Style,
}

impl Arrow {
  fn get_chevron(&self, scale: &Scale) -> Chevron {
    let direction = self.line_segment.p2.radian_to(&self.line_segment.p1) - PI * 0.5;
    let point = self.line_segment.p2;

    Chevron {
      point,
      direction,
      style: self.style.set_line_dash(scale, None),
    }
  }

  fn get_line_segment(&self, scale: &Scale) -> LineSegment {
    LineSegment {
      points: self.line_segment.into(),
      extend_start: false,
      extend_end: false,
      style: self.style.set_line_dash(scale, None),
    }
  }
}

impl Draw for Arrow {
  fn component(&self) -> Component {
    self.clone().into()
  }

  fn style(&self) -> &Style {
    &self.style
  }

  fn bbox(
    &self,
    context: &web_sys::OffscreenCanvasRenderingContext2d,
    canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
  ) -> Result<BBox, Error> {
    let chevron = self
      .get_chevron(scale)
      .bbox(context, canvas_bbox, content_bbox, scale)?;

    let line_segment =
      self
        .get_line_segment(scale)
        .bbox(context, canvas_bbox, content_bbox, scale)?;

    // TODO: Is this 0.15 pad legit?
    Ok(chevron.union(&line_segment).pad(0.15))
  }

  fn collides_with(
    &self,
    context: &web_sys::OffscreenCanvasRenderingContext2d,
    canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
    other: &Component,
  ) -> Result<bool, Error> {
    if match other {
      Component::Arrow(arrow) => arrow
        .bbox(context, canvas_bbox, content_bbox, scale)?
        .intersects_bbox(&self.bbox(context, canvas_bbox, content_bbox, scale)?),
      Component::Point(point) => point
        .bbox(context, canvas_bbox, content_bbox, scale)?
        .intersects_bbox(&self.bbox(context, canvas_bbox, content_bbox, scale)?),
      Component::LineSegment(line_segment) => line_segment.intersects_bbox(
        content_bbox,
        &self.bbox(context, canvas_bbox, content_bbox, scale)?,
      ),
      _ => false,
    } {
      return Ok(true);
    }

    Ok(false)
  }

  fn draw(
    &self,
    context: &web_sys::OffscreenCanvasRenderingContext2d,
    canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
    theia: &mut Theia,
  ) -> Result<(), Error> {
    if !theia.has_collision(context, canvas_bbox, content_bbox, scale, &self.component())? {
      self
        .get_line_segment(scale)
        .draw(context, canvas_bbox, content_bbox, scale, theia)?;
      self
        .get_chevron(scale)
        .draw(context, canvas_bbox, content_bbox, scale, theia)?;
    }

    Ok(())
  }
}

impl Eq for Arrow {}

impl PartialEq for Arrow {
  fn eq(&self, other: &Self) -> bool {
    self.line_segment == other.line_segment
  }
}
