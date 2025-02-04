use std::f32::consts::PI;

use hogg_geometry::{BBox, Point};

use super::{Draw, Style};
use crate::canvas::collision::Theia;
use crate::canvas::Scale;
use crate::Error;

#[derive(Clone, Debug, Default)]
pub struct Arc {
  point: Point,
  radius: f32,
  start_angle: f32,
  end_angle: f32,
  style: Style,
}

impl Arc {
  pub fn with_point(mut self, point: Point) -> Self {
    self.point = point;
    self
  }

  pub fn with_radius(mut self, radius: f32) -> Self {
    self.radius = radius;
    self
  }

  pub fn with_start_angle(mut self, start_angle: f32) -> Self {
    self.start_angle = start_angle;
    self
  }

  pub fn with_end_angle(mut self, end_angle: f32) -> Self {
    self.end_angle = end_angle;
    self
  }

  pub fn with_style(mut self, style: Style) -> Self {
    self.style = style;
    self
  }

  pub fn get_radius(&self, scale: &Scale) -> f32 {
    let line_thickness = self.style.get_line_thickness(scale);
    let chevron_size = self.style.get_chevron_size(scale);
    let stroke_width = self.style.get_stroke_width(scale);
    let outer_line_thickness = stroke_width + line_thickness;

    (self.radius - chevron_size.max(outer_line_thickness * 0.5)).max(chevron_size * 3.0)
  }

  fn get_start_angle(&self) -> f32 {
    self.start_angle - PI * 0.5
  }

  fn get_end_angle(&self) -> f32 {
    self.end_angle - PI * 0.5
  }

  fn draw_path(
    &self,
    context: &web_sys::OffscreenCanvasRenderingContext2d,
    scale: &Scale,
    style: &Style,
  ) -> Result<(), Error> {
    self.draw_start(context, scale, style)?;
    context.arc(
      self.point.x as f64,
      self.point.y as f64,
      self.get_radius(scale) as f64,
      self.get_start_angle() as f64,
      self.get_end_angle() as f64,
    )?;
    self.draw_end(context);

    Ok(())
  }
}

// https://stackoverflow.com/questions/77798747/how-to-calculate-the-bounding-box-of-an-arc
impl Draw for Arc {
  fn bbox(
    &self,
    _context: &web_sys::OffscreenCanvasRenderingContext2d,
    _canvas_bbox: &BBox,
    _content_bbox: &BBox,
    _scale: &Scale,
  ) -> BBox {
    let aa = self.start_angle - PI * 0.5;
    let ea = self.end_angle - PI * 0.5;

    let ax = self.point.x + self.radius * aa.cos();
    let ay = self.point.y + self.radius * aa.sin();
    let bx = self.point.x + self.radius * ea.cos();
    let by = self.point.y + self.radius * ea.sin();

    let ma = aa + (ea - aa) * 0.5;
    let mx = self.point.x + self.radius * ma.cos();
    let my = self.point.y + self.radius * ma.sin();

    let ex = self.point.x + self.radius;
    let ey = self.point.y;
    let nx = self.point.x;
    let ny = self.point.y + self.radius;
    let wx = self.point.x - self.radius;
    let wy = self.point.y;
    let sx = self.point.x;
    let sy = self.point.y - self.radius;

    let abm = (ax * (by - my) + bx * (my - ay) + mx * (ay - by)) / 2.0;
    let abe = (ax * (by - ey) + bx * (ey - ay) + ex * (ay - by)) / 2.0;
    let abn = (ax * (by - ny) + bx * (ny - ay) + nx * (ay - by)) / 2.0;
    let abw = (ax * (by - wy) + bx * (wy - ay) + wx * (ay - by)) / 2.0;
    let abs = (ax * (by - sy) + bx * (sy - ay) + sx * (ay - by)) / 2.0;

    let x_min = if abm * abw > 0.0 { wx } else { ax.min(bx) };
    let y_min = if abm * abs > 0.0 { sy } else { ay.min(by) };
    let x_max = if abm * abe > 0.0 { ex } else { ax.max(bx) };
    let y_max = if abm * abn > 0.0 { ny } else { ay.max(by) };

    let min = Point::at(x_min, y_min);
    let max = Point::at(x_max, y_max);

    BBox::from_min_max(min, max)
  }

  fn component(&self) -> super::Component {
    self.clone().into()
  }

  fn style(&self) -> &Style {
    &self.style
  }

  fn draw(
    &self,
    context: &web_sys::OffscreenCanvasRenderingContext2d,
    _canvas_bbox: &BBox,
    _content_bbox: &BBox,
    scale: &Scale,
    _theia: &mut Theia,
  ) -> Result<(), Error> {
    let line_thickness = self.style.get_line_thickness(scale);
    let stroke_width = self.style.get_stroke_width(scale);

    self.draw_path(
      context,
      scale,
      &self
        .style
        .set_fill(None)
        .set_stroke_width(scale, Some(line_thickness + (stroke_width * 2.0))),
    )?;

    self.draw_path(
      context,
      scale,
      &self
        .style
        .set_fill(None)
        .set_stroke_color(Some(self.style.get_fill()))
        .set_stroke_width(scale, Some(line_thickness)),
    )?;

    Ok(())
  }
}
