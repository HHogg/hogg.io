use geometry::BBox;

use super::{Component, Draw, Style};
use crate::canvas::Scale;
use crate::collision::Theia;
use crate::Error;

#[derive(Clone)]
pub struct Polygon {
  pub polygon: geometry::Polygon,
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
    _context: &web_sys::CanvasRenderingContext2d,
    _canvas_bbox: &BBox,
    _content_bbox: &BBox,
    _scale: &Scale,
  ) -> Result<BBox, Error> {
    Ok(self.polygon.bbox)
  }

  fn draw(
    &self,
    context: &web_sys::CanvasRenderingContext2d,
    _canvas_bbox: &BBox,
    _content_bbox: &BBox,
    scale: &Scale,
    _theia: &mut Theia,
  ) -> Result<(), Error> {
    self.draw_start(context, scale, &self.style)?;

    for (index, point) in self.polygon.points.iter().enumerate() {
      match index {
        0 => context.move_to(point.x, point.y),
        _ => context.line_to(point.x, point.y),
      }
    }

    context.line_to(self.polygon.points[0].x, self.polygon.points[0].y);

    self.draw_end(context);

    Ok(())
  }
}
