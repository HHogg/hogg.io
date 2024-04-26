use std::f64::consts::PI;

use tiling::notation::{Operation, OriginIndex, OriginType};
use tiling::Tiling;

use super::Layer;
use crate::canvas::{Arc, Canvas, LineSegment, LineSegmentArrows, Point, Style};
use crate::draw::Options;
use crate::Error;

pub fn draw_transform_eccentric(
  canvas: &mut Canvas<Layer>,
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

  let origin_point = tiling
    .plane
    .get_point_by_index_and_type(origin_type, origin_index)
    .ok_or(Error::InvalidTiling {
      reason: "transform origin not found",
    })?;

  let reflection_line_segment = tiling
    .plane
    .get_reflection_line(origin_index, origin_type)
    .ok_or(Error::InvalidTiling {
      reason: "transform reflection line not found",
    })?;

  canvas.add_component(
    Layer::AnnotationLines,
    LineSegment {
      points: reflection_line_segment.into(),
      extend_start: true,
      extend_end: true,
      style: transform_style.set_line_dash(&canvas.scale, None),
    }
    .into(),
  )?;

  canvas.add_component(
    Layer::AnnotationLines,
    Point {
      point: *origin_point,
      style: transform_style.clone(),
    }
    .into(),
  )?;

  match operation {
    Operation::Reflect => {
      draw_transform_eccentric_reflect(
        canvas,
        origin_point,
        reflection_line_segment,
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
  canvas: &mut Canvas<Layer>,
  origin_point: &tiling::geometry::Point,
  line_segment: tiling::geometry::LineSegment,
  style: &Style,
) -> Result<(), Error> {
  let line_segment_p1 = tiling::geometry::LineSegment::default()
    .with_start(*origin_point)
    .with_end(line_segment.p1);

  let line_segment_p2 = tiling::geometry::LineSegment::default()
    .with_start(*origin_point)
    .with_end(line_segment.p2);

  canvas.add_component(
    Layer::AnnotationArrows,
    LineSegmentArrows {
      line_segment: line_segment_p1,
      extend_start: false,
      extend_end: true,
      direction: PI * 0.5,
      style: style.clone(),
    }
    .into(),
  )?;

  canvas.add_component(
    Layer::AnnotationArrows,
    LineSegmentArrows {
      line_segment: line_segment_p2,
      extend_start: false,
      extend_end: true,
      direction: PI * -0.5,
      style: style.clone(),
    }
    .into(),
  )?;

  Ok(())
}

fn draw_transform_eccentric_rotate(
  canvas: &mut Canvas<Layer>,
  tiling: &Tiling,
  origin_point: &tiling::geometry::Point,
  origin_type: &OriginType,
  style: &Style,
) -> Result<(), Error> {
  let start_angle = match origin_type {
    OriginType::MidPoint => {
      if let Some(line_segment) = tiling.plane.line_segments_by_mid_point.get(origin_point) {
        line_segment.p2.radian_to(origin_point)
      } else {
        0.0
      }
    }
    _ => origin_point.theta() + PI * 0.5,
  };

  let end_angle = start_angle + PI;
  let arc_angle_padding = PI * 0.05;
  let radius = canvas.content_bbox().radius() + origin_point.distance_to_center();

  canvas.add_component(
    Layer::AnnotationArrows,
    Arc {
      point: *origin_point,
      radius,
      start_angle: start_angle + arc_angle_padding,
      end_angle: end_angle - arc_angle_padding,
      style: style.set_line_dash(&canvas.scale, None),
    }
    .into(),
  )?;

  canvas.add_component(
    Layer::AnnotationArrows,
    Arc {
      point: *origin_point,
      radius,
      start_angle: start_angle + PI + arc_angle_padding,
      end_angle: end_angle + PI - arc_angle_padding,
      style: style.set_line_dash(&canvas.scale, None),
    }
    .into(),
  )?;

  Ok(())
}
