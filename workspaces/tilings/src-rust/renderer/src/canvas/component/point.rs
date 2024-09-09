use std::f64::consts::PI;

use tiling::geometry::BBox;

use super::{Component, Draw, Style};
use crate::canvas::collision::Theia;
use crate::canvas::Scale;
use crate::Error;

#[derive(Clone)]
pub struct Point {
  pub point: tiling::geometry::Point,
  pub style: Style,
}

impl Point {
  fn draw_path(
    &self,
    context: &web_sys::OffscreenCanvasRenderingContext2d,
    scale: &Scale,
    style: &Style,
  ) -> Result<(), Error> {
    let radius = style.get_point_radius(scale);

    self.draw_start(context, scale, style)?;
    context.ellipse(
      self.point.x,
      self.point.y,
      radius,
      radius,
      0.0,
      0.0,
      PI * 2.0,
    )?;
    self.draw_end(context);

    Ok(())
  }
}

impl Draw for Point {
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
    scale: &Scale,
  ) -> Result<BBox, Error> {
    let radius = self.style.get_point_radius(scale);

    let min = self
      .point
      .clone()
      .translate(&tiling::geometry::Point::default().with_xy(-radius, -radius));

    let max = self
      .point
      .clone()
      .translate(&tiling::geometry::Point::default().with_xy(radius, radius));

    Ok(BBox { min, max })
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
}
