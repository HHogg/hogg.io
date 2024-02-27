use std::f64::consts::PI;

use geometry::BBox;

use super::{Chevron, Component, Draw, LineSegment, Style};
use crate::canvas::Scale;
use crate::collision::Theia;
use crate::Error;

#[derive(Clone)]
pub struct Arrow {
  pub line_segment: geometry::LineSegment,
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

  fn bbox(&self, canvas_bbox: &BBox, content_bbox: &BBox, scale: &Scale) -> BBox {
    let chevron = self
      .get_chevron(scale)
      .bbox(canvas_bbox, content_bbox, scale);

    let line_segment = self
      .get_line_segment(scale)
      .bbox(canvas_bbox, content_bbox, scale);

    chevron.union(&line_segment).pad(0.15)
  }

  fn collides_with(
    &self,
    canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
    other: &Component,
  ) -> bool {
    if match other {
      Component::Arrow(arrow) => {
        arrow
          .bbox(canvas_bbox, content_bbox, scale)
          .intersects_bbox(&self.bbox(canvas_bbox, content_bbox, scale))
      }
      Component::Point(point) => {
        point
          .bbox(canvas_bbox, content_bbox, scale)
          .intersects_bbox(&self.bbox(canvas_bbox, content_bbox, scale))
      }
      Component::LineSegment(line_segment) => {
        line_segment.intersects_bbox(content_bbox, &self.bbox(canvas_bbox, content_bbox, scale))
      }
      _ => false,
    } {
      return true;
    }

    false
  }

  fn draw(
    &self,
    context: &web_sys::CanvasRenderingContext2d,
    canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
    theia: &mut Theia,
  ) -> Result<(), Error> {
    if !theia.has_collision(canvas_bbox, content_bbox, scale, &self.component()) {
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
