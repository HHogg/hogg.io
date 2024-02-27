use std::f64::consts::PI;

use geometry::BBox;

use super::{Component, Draw, LineSegment, Style};
use crate::canvas::Scale;
use crate::collision::Theia;
use crate::Error;

#[derive(Clone)]
pub struct Chevron {
  pub point: geometry::Point,
  pub direction: f64,
  pub style: Style,
}

impl Chevron {
  fn get_points(&self, scale: &Scale) -> Vec<geometry::Point> {
    let size = self.style.get_chevron_size(scale);

    let point_1 = geometry::Point::default()
      .with_xy(self.point.x - size, self.point.y - size)
      .rotate(self.direction - PI * 0.5, Some(&self.point));
    let point_2 = geometry::Point::default().with_xy(self.point.x, self.point.y);
    let point_3 = geometry::Point::default()
      .with_xy(self.point.x + size, self.point.y - size)
      .rotate(self.direction - PI * 0.5, Some(&self.point));

    vec![point_1, point_2, point_3]
  }

  fn get_line_segment(&self, scale: &Scale) -> LineSegment {
    LineSegment {
      points: self.get_points(scale),
      extend_start: false,
      extend_end: false,
      style: self.style.set_line_dash(scale, None),
    }
  }
}

impl Draw for Chevron {
  fn component(&self) -> Component {
    self.clone().into()
  }

  fn bbox(&self, canvas_bbox: &BBox, content_bbox: &BBox, scale: &Scale) -> BBox {
    self
      .get_line_segment(scale)
      .bbox(canvas_bbox, content_bbox, scale)
  }

  fn draw(
    &self,
    context: &web_sys::CanvasRenderingContext2d,
    canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
    theia: &mut Theia,
  ) -> Result<(), Error> {
    self
      .get_line_segment(scale)
      .draw(context, canvas_bbox, content_bbox, scale, theia)?;
    Ok(())
  }
}
