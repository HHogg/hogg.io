use geometry::{BBox, Point};

use super::{Draw, Style};
use crate::canvas::collision::Theia;
use crate::canvas::Scale;
use crate::Error;

#[derive(Clone, Debug, Default)]
pub struct LineSegment {
  points: Vec<Point>,
  extend_start: bool,
  extend_end: bool,
  interactive: Option<bool>,
  style: Style,
}

impl LineSegment {
  pub fn non_interactive(mut self) -> Self {
    self.interactive = Some(false);
    self
  }

  pub fn with_extend_start(mut self, extend_start: bool) -> Self {
    self.extend_start = extend_start;
    self
  }

  pub fn with_extend_end(mut self, extend_end: bool) -> Self {
    self.extend_end = extend_end;
    self
  }

  pub fn with_points(mut self, points: Vec<Point>) -> Self {
    self.points = points;
    self
  }

  pub fn with_style(mut self, style: Style) -> Self {
    self.style = style;
    self
  }

  fn get_points(&self, bbox: &BBox) -> Vec<Point> {
    get_extended_points_to_bbox(&self.points, bbox, self.extend_start, self.extend_end)
  }

  fn draw_path(
    &self,
    context: &web_sys::OffscreenCanvasRenderingContext2d,
    _canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
    style: &Style,
  ) -> Result<(), Error> {
    self.draw_start(context, scale, style)?;

    for (index, point) in self.get_points(content_bbox).iter().enumerate() {
      match index {
        0 => context.move_to(point.x as f64, point.y as f64),
        _ => context.line_to(point.x as f64, point.y as f64),
      }
    }

    self.draw_end(context);
    Ok(())
  }
}

impl Draw for LineSegment {
  fn style(&self) -> &Style {
    &self.style
  }

  fn bbox(
    &self,
    _context: &web_sys::OffscreenCanvasRenderingContext2d,
    _canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
  ) -> BBox {
    let points = self.get_points(content_bbox);
    let line_thickness = self.style.get_line_thickness(scale);
    let stroke_width = self.style.get_stroke_width(scale);
    let width = line_thickness + stroke_width;

    match points.len() {
      0 => BBox::default(),
      1 => BBox::default().with_center(points[0]),
      2 => {
        let a = points[0];
        let b = points[1];
        let line_segment = geometry::LineSegment::default()
          .with_start(a)
          .with_end(b)
          .extend_to_bbox(content_bbox, self.extend_start, self.extend_end);

        BBox::default()
          .with_center(line_segment.mid_point())
          .with_height(line_segment.length() + width)
          .with_width(width)
          .with_rotation(line_segment.theta())
      }
      _ => {
        let bbox: BBox = (&points).into();

        bbox
          .with_width(bbox.width() + width)
          .with_height(bbox.height() + width)
      }
    }
  }

  fn component(&self) -> super::Component {
    self.clone().into()
  }

  fn draw(
    &self,
    context: &web_sys::OffscreenCanvasRenderingContext2d,
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
        .set_stroke_color(Some(self.style.get_fill()))
        .set_stroke_width(scale, Some(line_thickness)),
    )?;

    Ok(())
  }

  fn interactive(&self) -> Option<bool> {
    self.interactive
  }
}

pub fn get_extended_points_to_bbox(
  points: &[Point],
  bbox: &BBox,
  extend_start: bool,
  extend_end: bool,
) -> Vec<Point> {
  let mut extended_points = vec![];

  for (index, point) in points.iter().enumerate() {
    let mut point = *point;

    if extend_start && index == 0 {
      let line_segment = geometry::LineSegment::default()
        .with_start(points[0])
        .with_end(points[1])
        .extend_to_bbox(bbox, extend_start, false);
      point = line_segment.start;
    }

    if extend_end && index == points.len() - 1 {
      let line_segment = geometry::LineSegment::default()
        .with_start(points[points.len() - 2])
        .with_end(points[points.len() - 1])
        .extend_to_bbox(bbox, false, extend_end);

      point = line_segment.end;
    }

    extended_points.push(point);
  }

  extended_points
}
