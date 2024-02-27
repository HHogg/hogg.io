use std::f64::consts::PI;

use geometry::{BBox, Point};

use super::{Chevron, Component, Draw, Style};
use crate::canvas::Scale;
use crate::collision::Theia;
use crate::Error;

#[derive(Clone)]
pub struct Arc {
  pub point: Point,
  pub radius: f64,
  pub start_angle: f64,
  pub end_angle: f64,
  pub style: Style,
}

impl Arc {
  fn get_radius(&self, scale: &Scale) -> f64 {
    let line_thickness = self.style.get_line_thickness(scale);
    let chevron_size = self.style.get_chevron_size(scale);
    let stroke_width = self.style.get_stroke_width(scale);
    let outer_line_thickness = stroke_width + line_thickness;

    (self.radius - chevron_size.max(outer_line_thickness * 0.5)).max(chevron_size * 3.0)
  }

  fn get_chevron(&self, scale: &Scale) -> Chevron {
    Chevron {
      point: self
        .point
        .translate(&Point::default().with_xy(0.0, -self.get_radius(scale)))
        .rotate(self.end_angle, Some(&self.point)),
      direction: self.end_angle,
      style: self.style.clone(),
    }
  }

  fn draw_path(
    &self,
    context: &web_sys::CanvasRenderingContext2d,
    scale: &Scale,
    style: &Style,
  ) -> Result<(), Error> {
    self.draw_start(context, scale, style)?;
    context.arc(
      self.point.x,
      self.point.y,
      self.get_radius(scale),
      self.start_angle - PI * 0.5,
      self.end_angle - PI * 0.5,
    )?;
    self.draw_end(context);

    Ok(())
  }
}

impl Draw for Arc {
  fn bbox(&self, _canvas_bbox: &BBox, content_bbox: &BBox, scale: &Scale) -> BBox {
    let radius = self.get_radius(scale);

    let min = self
      .point
      .clone()
      .translate(&Point::default().with_xy(-radius, -radius));

    let max = self
      .point
      .clone()
      .translate(&Point::default().with_xy(radius, radius));

    let arc_bbox = BBox { min, max };

    self
      .get_chevron(scale)
      .bbox(&arc_bbox, content_bbox, scale)
      .union(&arc_bbox)
  }

  fn component(&self) -> Component {
    self.clone().into()
  }

  fn draw(
    &self,
    context: &web_sys::CanvasRenderingContext2d,
    canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
    theia: &mut Theia,
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
        .set_stroke_color(self.style.get_fill())
        .set_stroke_width(scale, Some(line_thickness)),
    )?;

    self
      .get_chevron(scale)
      .draw(context, canvas_bbox, content_bbox, scale, theia)?;

    Ok(())
  }
}
