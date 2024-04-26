use tiling::geometry::{BBox, Point};

use super::{Component, Draw, Style};
use crate::canvas::collision::Theia;
use crate::canvas::Scale;
use crate::Error;

#[derive(Clone)]
pub struct LineSegment {
  pub points: Vec<Point>,
  pub extend_start: bool,
  pub extend_end: bool,
  pub style: Style,
}

impl LineSegment {
  fn get_points(&self, bbox: &BBox) -> Vec<Point> {
    get_extended_points_to_bbox(&self.points, bbox, self.extend_start, self.extend_end)
  }

  fn draw_path(
    &self,
    context: &web_sys::CanvasRenderingContext2d,
    _canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
    style: &Style,
  ) -> Result<(), Error> {
    self.draw_start(context, scale, style)?;

    for (index, point) in self.get_points(content_bbox).iter().enumerate() {
      match index {
        0 => context.move_to(point.x, point.y),
        _ => context.line_to(point.x, point.y),
      }
    }

    self.draw_end(context);
    Ok(())
  }

  pub fn intersects_bbox(&self, content_bbox: &BBox, bbox: &BBox) -> bool {
    for window in self.get_points(content_bbox).windows(2) {
      let a = &window[0];
      let b = &window[1];
      let line_segment = tiling::geometry::LineSegment::default()
        .with_start(*a)
        .with_end(*b);

      if line_segment.intersects_bbox(bbox) {
        return true;
      }
    }

    false
  }
}

impl Draw for LineSegment {
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
    content_bbox: &BBox,
    scale: &Scale,
  ) -> Result<BBox, Error> {
    let mut min = Point::default().with_xy(std::f64::INFINITY, std::f64::INFINITY);
    let mut max = Point::default().with_xy(std::f64::NEG_INFINITY, std::f64::NEG_INFINITY);

    for point in self.get_points(content_bbox) {
      if point.x < min.x {
        min.x = point.x
      }

      if point.x > max.x {
        max.x = point.x
      }

      if point.y < min.y {
        min.y = point.y
      }

      if point.y > max.y {
        max.y = point.y
      }
    }

    let line_thickness = self.style.get_line_thickness(scale) * 0.5;
    let stroke_width = self.style.get_stroke_width(scale) * 0.5;
    let offset = line_thickness + stroke_width;

    Ok(
      BBox::default()
        .with_min(min.translate(&Point::default().with_xy(-offset, -offset)))
        .with_max(max.translate(&Point::default().with_xy(offset, offset))),
    )
  }

  fn draw(
    &self,
    context: &web_sys::CanvasRenderingContext2d,
    canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
    _theia: &mut Theia,
  ) -> Result<(), Error> {
    let line_thickness = self.style.get_line_thickness(scale);
    let stroke_width = self.style.get_stroke_width(scale);

    self.draw_path(
      context,
      canvas_bbox,
      content_bbox,
      scale,
      &self
        .style
        .set_fill(None)
        .set_stroke_width(scale, Some(line_thickness + (stroke_width * 2.0))),
    )?;

    self.draw_path(
      context,
      canvas_bbox,
      content_bbox,
      scale,
      &self
        .style
        .set_fill(None)
        .set_stroke_color(self.style.get_fill())
        .set_stroke_width(scale, Some(line_thickness)),
    )?;

    Ok(())
  }
}

///
pub fn get_extended_points_to_bbox(
  points: &Vec<Point>,
  bbox: &BBox,
  extend_start: bool,
  extend_end: bool,
) -> Vec<Point> {
  let mut extended_points = vec![];

  for (index, point) in points.iter().enumerate() {
    let mut point = *point;

    if extend_start && index == 0 {
      let line_segment = tiling::geometry::LineSegment::default()
        .with_start(points[0])
        .with_end(points[1])
        .extend_to_bbox(bbox, extend_start, false);
      point = line_segment.p1;
    }

    if extend_end && index == points.len() - 1 {
      let line_segment = tiling::geometry::LineSegment::default()
        .with_start(points[points.len() - 2])
        .with_end(points[points.len() - 1])
        .extend_to_bbox(bbox, false, extend_end);
      point = line_segment.p2;
    }

    extended_points.push(point);
  }

  extended_points
}
