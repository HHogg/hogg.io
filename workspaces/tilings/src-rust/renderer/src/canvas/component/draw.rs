use hogg_geometry::{BBox, Point};

use super::{Component, Style};
use crate::canvas::collision::Theia;
use crate::canvas::Scale;
use crate::Error;

pub trait Draw {
  fn bbox(
    &self,
    _context: &web_sys::OffscreenCanvasRenderingContext2d,
    _canvas_bbox: &BBox,
    _content_bbox: &BBox,
    _scale: &Scale,
  ) -> BBox {
    BBox::default()
  }

  fn children(
    &self,
    _canvas_bbox: &BBox,
    _content_bbox: &BBox,
    _scale: &Scale,
  ) -> Option<Vec<Box<dyn Draw>>> {
    None
  }

  fn component(&self) -> Component;

  fn draw_start(
    &self,
    context: &web_sys::OffscreenCanvasRenderingContext2d,
    scale: &Scale,
    style: &Style,
  ) -> Result<(), Error> {
    style.apply(context, scale)?;
    context.begin_path();

    Ok(())
  }

  fn draw_end(&self, context: &web_sys::OffscreenCanvasRenderingContext2d) {
    context.stroke();
    context.fill();
    context.close_path();
  }

  fn draw_bbox(
    &self,
    context: &web_sys::OffscreenCanvasRenderingContext2d,
    canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
    style: &Style,
  ) -> Result<(), Error> {
    let bbox = self.bbox(context, canvas_bbox, content_bbox, scale);
    let points: [Point; 4] = (&bbox).into();

    self.draw_start(context, scale, style)?;

    for (index, point) in points.iter().enumerate() {
      match index {
        0 => context.move_to(point.x as f64, point.y as f64),
        _ => context.line_to(point.x as f64, point.y as f64),
      }
    }

    context.line_to(points[0].x as f64, points[0].y as f64);

    self.draw_end(context);

    Ok(())
  }

  fn draw(
    &self,
    _context: &web_sys::OffscreenCanvasRenderingContext2d,
    _canvas_bbox: &BBox,
    _content_bbox: &BBox,
    _scale: &Scale,
    _theia: &mut Theia,
  ) -> Result<(), Error> {
    Ok(())
  }

  fn interactive(&self) -> Option<bool> {
    Some(true)
  }

  fn style(&self) -> &Style;
}
