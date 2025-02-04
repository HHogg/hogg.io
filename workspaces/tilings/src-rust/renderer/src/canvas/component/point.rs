use geometry::BBox;

use super::{Draw, Style};
use crate::canvas::collision::Theia;
use crate::canvas::Scale;
use crate::Error;

#[derive(Clone, Debug, Default)]
pub struct Point {
  point: geometry::Point,
  interactive: Option<bool>,
  style: Style,
}

impl Point {
  pub fn non_interactive(mut self) -> Self {
    self.interactive = Some(false);
    self
  }

  pub fn with_point(mut self, point: geometry::Point) -> Self {
    self.point = point;
    self
  }

  pub fn with_style(mut self, style: Style) -> Self {
    self.style = style;
    self
  }

  fn draw_path(
    &self,
    context: &web_sys::OffscreenCanvasRenderingContext2d,
    scale: &Scale,
    style: &Style,
  ) -> Result<(), Error> {
    let radius = style.get_point_radius(scale);

    self.draw_start(context, scale, style)?;
    context.ellipse(
      self.point.x as f64,
      self.point.y as f64,
      radius as f64,
      radius as f64,
      0.0,
      0.0,
      std::f64::consts::PI * 2.0,
    )?;
    self.draw_end(context);

    Ok(())
  }
}

impl Draw for Point {
  fn component(&self) -> super::Component {
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
    scale: &Scale,
  ) -> BBox {
    let radius = self.style.get_point_radius(scale);

    let min = self
      .point
      .clone()
      .translate(&geometry::Point::at(-radius, -radius));

    let max = self
      .point
      .clone()
      .translate(&geometry::Point::at(radius, radius));

    BBox::from_min_max(min, max)
  }

  fn draw(
    &self,
    context: &web_sys::OffscreenCanvasRenderingContext2d,
    _canvas_bbox: &BBox,
    _content_bbox: &BBox,
    scale: &Scale,
    _theia: &mut Theia,
  ) -> Result<(), Error> {
    let point_radius = self.style.get_point_radius(scale);
    let stroke_color = self.style.get_stroke_color();
    let stroke_width = self.style.get_stroke_width(scale);

    self.draw_path(
      context,
      scale,
      &self
        .style
        .set_fill(Some(stroke_color))
        .set_stroke_width(scale, None)
        .set_point_radius(scale, Some(stroke_width + point_radius)),
    )?;

    self.draw_path(context, scale, &self.style.set_stroke_width(scale, None))?;

    Ok(())
  }

  fn interactive(&self) -> Option<bool> {
    self.interactive
  }
}
