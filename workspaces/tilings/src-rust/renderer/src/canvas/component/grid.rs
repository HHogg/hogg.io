use tiling::geometry::{BBox, Point};

use super::{Component, Draw, Style};
use crate::canvas::collision::Theia;
use crate::canvas::Scale;
use crate::Error;

#[derive(Clone)]
pub struct Grid {
  pub size: u64,
  pub spacing: f64,
  pub style: Style,
}

impl Grid {
  fn draw_line(
    &self,
    context: &web_sys::OffscreenCanvasRenderingContext2d,
    scale: &Scale,
    start: Point,
    end: Point,
    style: &Style,
    thick_line: bool,
  ) -> Result<(), Error> {
    let style = if thick_line {
      style.clone().set_opacity(Some(1.0))
    } else {
      style.clone()
    };

    self.draw_start(context, scale, &style)?;
    context.move_to(start.x, start.y);
    context.line_to(end.x, end.y);
    self.draw_end(context);
    Ok(())
  }

  fn draw_grid(
    &self,
    context: &web_sys::OffscreenCanvasRenderingContext2d,
    scale: &Scale,
    style: &Style,
    offset: Option<Point>,
  ) -> Result<(), Error> {
    let Point {
      x: offset_x,
      y: offset_y,
      ..
    } = offset.unwrap_or_default();

    let min_x = ((self.size as f64) * -0.5) * self.spacing + offset_x;
    let max_x = ((self.size as f64) * 0.5) * self.spacing + offset_x;
    let min_y = ((self.size as f64) * -0.5) * self.spacing + offset_y;
    let max_y = ((self.size as f64) * 0.5) * self.spacing + offset_y;

    // Draw horizontal lines
    for i in 0..=self.size {
      let thick_line = i % 8 == 0;
      let y = min_y + (i as f64) * self.spacing;

      self.draw_line(
        context,
        scale,
        Point::at(min_x, y),
        Point::at(max_x, y),
        style,
        thick_line,
      )?;
    }

    // Draw vertical lines
    for i in 0..=self.size {
      let thick_line = i % 8 == 0;
      let x = min_x + (i as f64) * self.spacing;

      self.draw_line(
        context,
        scale,
        Point::at(x, min_y),
        Point::at(x, max_y),
        style,
        thick_line,
      )?;
    }

    Ok(())
  }
}

impl Draw for Grid {
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
    // We don't want to calculate the bounding box for the grid
    // because it can be much larger than the content
    Ok(BBox::default())
  }

  fn draw(
    &self,
    context: &web_sys::OffscreenCanvasRenderingContext2d,
    _canvas_bbox: &BBox,
    _content_bbox: &BBox,
    scale: &Scale,
    _theia: &mut Theia,
  ) -> Result<(), Error> {
    self.draw_grid(
      context,
      scale,
      &self
        .style
        .set_opacity(None)
        .set_stroke_color(self.style.get_fill()),
      None,
    )?;

    self.draw_grid(context, scale, &self.style, None)?;

    Ok(())
  }
}
