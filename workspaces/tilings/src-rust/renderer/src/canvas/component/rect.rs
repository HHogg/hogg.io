use tiling::geometry::{BBox, Point};

use super::{Component, Draw, Style, Theia};
use crate::canvas::Scale;
use crate::Error;

#[derive(Clone)]
pub struct Rect {
  pub min: Point,
  pub max: Point,
  pub style: Style,
}

impl Draw for Rect {
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
    Ok(BBox::default().with_min(self.min).with_max(self.max))
  }

  fn draw(
    &self,
    context: &web_sys::CanvasRenderingContext2d,
    _canvas_bbox: &BBox,
    _content_bbox: &BBox,
    scale: &Scale,
    _theia: &mut Theia,
  ) -> Result<(), Error> {
    let bbox = BBox::default().with_min(self.min).with_max(self.max);

    self.draw_start(context, scale, &self.style)?;
    context.rect(bbox.min.x, bbox.min.y, bbox.width(), bbox.height());
    self.draw_end(context);

    Ok(())
  }
}
