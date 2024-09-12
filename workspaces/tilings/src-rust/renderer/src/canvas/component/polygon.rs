use tiling::geometry::BBox;

use super::{Component, Draw, Style};
use crate::canvas::collision::Theia;
use crate::canvas::Scale;
use crate::Error;

#[derive(Clone)]
pub struct Polygon {
  pub polygon: tiling::geometry::Polygon,
  pub scale: u8,
  pub style: Style,
}

impl Draw for Polygon {
  fn component(&self) -> Component {
    self.clone().into()
  }

  fn style(&self) -> &Style {
    &self.style
  }

  fn bbox(
    &self,
    _context: &web_sys::OffscreenCanvasRenderingContext2d,
    _canvas_bbox: &BBox,
    _content_bbox: &BBox,
    _scale: &Scale,
  ) -> Result<BBox, Error> {
    Ok(self.polygon.bbox.mul(self.scale as f64))
  }

  fn draw(
    &self,
    context: &web_sys::OffscreenCanvasRenderingContext2d,
    _canvas_bbox: &BBox,
    _content_bbox: &BBox,
    scale: &Scale,
    _theia: &mut Theia,
  ) -> Result<(), Error> {
    self.draw_start(context, scale, &self.style)?;

    for (index, point) in self.polygon.points.iter().enumerate() {
      let point = point.scale(self.scale as f64);

      match index {
        0 => context.move_to(point.x, point.y),
        _ => context.line_to(point.x, point.y),
      }
    }

    let first_point = self
      .polygon
      .points
      .first()
      .unwrap()
      .scale(self.scale as f64);

    context.line_to(first_point.x, first_point.y);

    self.draw_end(context);

    Ok(())
  }
}
