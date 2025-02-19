use hogg_geometry::BBox;

use super::{Draw, Style};
use crate::canvas::collision::Theia;
use crate::canvas::Scale;
use crate::Error;

#[derive(Clone, Debug, Default)]
pub struct Polygon {
  polygon: hogg_geometry::Polygon,
  style: Style,
  interactive: Option<bool>,
}

impl Polygon {
  pub fn non_interactive(mut self) -> Self {
    self.interactive = Some(false);
    self
  }

  pub fn with_polygon(mut self, polygon: hogg_geometry::Polygon) -> Self {
    self.polygon = polygon;
    self
  }

  pub fn with_style(mut self, style: Style) -> Self {
    self.style = style;
    self
  }
}

impl Draw for Polygon {
  fn style(&self) -> &Style {
    &self.style
  }

  fn bbox(
    &self,
    _context: &web_sys::OffscreenCanvasRenderingContext2d,
    _canvas_bbox: &BBox,
    _content_bbox: &BBox,
    _scale: &Scale,
  ) -> BBox {
    let min = self.polygon.bbox.min();
    let max = self.polygon.bbox.max();

    BBox::from_min_max(min, max)
  }

  fn component(&self) -> super::Component {
    self.clone().into()
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
      match index {
        0 => context.move_to(point.x, point.y),
        _ => context.line_to(point.x, point.y),
      }
    }

    let first_point = self
      .polygon
      .points
      .first()
      .expect("First point for polygon not found");

    context.line_to(first_point.x, first_point.y);

    self.draw_end(context);

    Ok(())
  }

  fn interactive(&self) -> Option<bool> {
    self.interactive
  }
}
