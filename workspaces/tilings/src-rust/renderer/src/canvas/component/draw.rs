use tiling::BBox;
use web_sys::CanvasRenderingContext2d;

use super::{Component, Style};
use crate::canvas::collision::Theia;
use crate::canvas::Scale;
use crate::Error;

pub trait Draw {
  fn bbox(&self, _canvas_bbox: &BBox, _content_bbox: &BBox, _scale: &Scale) -> BBox {
    BBox::default()
  }

  fn component(&self) -> Component;

  fn collides_with(
    &self,
    _canvas_bbox: &BBox,
    _content_bbox: &BBox,
    _scale: &Scale,
    _other: &Component,
  ) -> bool {
    false
  }

  fn draw_start(
    &self,
    context: &CanvasRenderingContext2d,
    scale: &Scale,
    style: &Style,
  ) -> Result<(), Error> {
    style.apply(context, scale)?;
    context.begin_path();

    Ok(())
  }

  fn draw_end(&self, context: &CanvasRenderingContext2d) {
    context.stroke();
    context.fill();
    context.close_path();
  }

  fn draw_bbox(
    &self,
    context: &CanvasRenderingContext2d,
    canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
    style: &Style,
  ) -> Result<(), Error> {
    let bbox = self.bbox(canvas_bbox, content_bbox, scale);

    style.apply(context, scale)?;
    context.begin_path();
    context.rect(bbox.min.x, bbox.min.y, bbox.width(), bbox.height());
    self.draw_end(context);

    Ok(())
  }

  fn draw(
    &self,
    _context: &CanvasRenderingContext2d,
    _canvas_bbox: &BBox,
    _content_bbox: &BBox,
    _scale: &Scale,
    _theia: &mut Theia,
  ) -> Result<(), Error> {
    Ok(())
  }
}
