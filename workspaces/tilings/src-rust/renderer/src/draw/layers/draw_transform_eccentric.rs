use std::f64::consts::PI;

use tiling::notation::{Operation, OriginIndex, OriginType};
use tiling::Tiling;

use super::Layer;
use crate::canvas::{ArcArrow, Canvas, LineSegment, LineSegmentArrows, Point, Style};
use crate::draw::Options;
use crate::Error;

pub fn draw_transform_eccentric(
  canvas: &mut Canvas,
  options: &Options,
  tiling: &Tiling,
  operation: &Operation,
  origin_type: &OriginType,
  origin_index: &OriginIndex,
) -> Result<(), Error> {
  let transform_style = options
    .styles
    .transform_eccentric
    .clone()
    .unwrap_or_default();

  let origin_point = &tiling
    .plane
    .get_point_by_index_and_type(origin_type, origin_index)
    .ok_or(Error::InvalidTiling {
      reason: "transform origin not found",
    })?;

  let transform_line_segment = tiling
    .plane
    .get_reflection_line(origin_index, origin_type)
    .ok_or(Error::InvalidTiling {
      reason: "transform line segment not found",
    })?;

  canvas.add_component(
    Layer::Transform,
    LineSegment::default()
      .with_points(transform_line_segment.into())
      .with_extend_start(true)
      .with_extend_end(true)
      .with_style(transform_style.set_line_dash(&canvas.scale, None))
      .into(),
  )?;

  canvas.add_component(
    Layer::Transform,
    Point::default()
      .non_interactive()
      .with_point(*origin_point)
      .with_style(transform_style.clone())
      .into(),
  )?;

  match operation {
    Operation::Reflect => {
      draw_transform_eccentric_reflect(
        canvas,
        origin_point,
        transform_line_segment,
        &transform_style,
      )?;
    }
    Operation::Rotate => {
      draw_transform_eccentric_rotate(canvas, tiling, origin_point, origin_type, &transform_style)?;
    }
  }

  Ok(())
}

fn draw_transform_eccentric_reflect(
  canvas: &mut Canvas,
  origin_point: &tiling::geometry::Point,
  line_segment: tiling::geometry::LineSegment,
  style: &Style,
) -> Result<(), Error> {
  let line_segment_p1 = tiling::geometry::LineSegment::default()
    .with_start(*origin_point)
    .with_end(line_segment.start);

  let line_segment_p2 = tiling::geometry::LineSegment::default()
    .with_start(*origin_point)
    .with_end(line_segment.end);

  canvas.add_component(
    Layer::Transform,
    LineSegmentArrows::default()
      .with_line_segment(line_segment_p1)
      .with_extend_start(false)
      .with_extend_end(true)
      .with_direction(PI * 0.5)
      .with_style(style.clone())
      .into(),
  )?;

  canvas.add_component(
    Layer::Transform,
    LineSegmentArrows::default()
      .with_line_segment(line_segment_p2)
      .with_extend_start(false)
      .with_extend_end(true)
      .with_direction(PI * -0.5)
      .with_style(style.clone())
      .into(),
  )?;

  Ok(())
}

fn draw_transform_eccentric_rotate(
  canvas: &mut Canvas,
  tiling: &Tiling,
  origin_point: &tiling::geometry::Point,
  origin_type: &OriginType,
  style: &Style,
) -> Result<(), Error> {
  let start_angle = match origin_type {
    OriginType::MidPoint => {
      if let Some(line_segment) = tiling.plane.line_segments.get_value(&origin_point.into()) {
        line_segment.end.radian_to(origin_point)
      } else {
        0.0
      }
    }
    _ => origin_point.theta() + PI * 0.5,
  };

  let end_angle = start_angle + PI;
  let arc_angle_padding = PI * 0.05;
  let radius = canvas.content_bbox().radius_min();

  canvas.add_component(
    Layer::Transform,
    ArcArrow::default()
      .with_point(*origin_point)
      .with_radius(radius)
      .with_start_angle(start_angle + arc_angle_padding)
      .with_end_angle(end_angle - arc_angle_padding)
      .with_style(style.set_line_dash(&canvas.scale, None))
      .into(),
  )?;

  canvas.add_component(
    Layer::Transform,
    ArcArrow::default()
      .with_point(*origin_point)
      .with_radius(radius)
      .with_start_angle(start_angle + PI + arc_angle_padding)
      .with_end_angle(end_angle + PI - arc_angle_padding)
      .with_style(style.set_line_dash(&canvas.scale, None))
      .into(),
  )?;

  Ok(())
}
