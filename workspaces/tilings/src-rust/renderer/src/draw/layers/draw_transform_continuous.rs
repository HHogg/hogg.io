use std::f64::consts::PI;

use tiling::{math, Operation, TransformValue};

use super::Layer;
use crate::canvas::{Arc, Canvas, LineSegment, LineSegmentArrows, Point, Style};
use crate::draw::Options;
use crate::Error;

pub fn draw_transform_continuous(
  canvas: &mut Canvas<Layer>,
  options: &Options,
  operation: &Operation,
  transform_value: &TransformValue,
) -> Result<(), Error> {
  let style = options
    .styles
    .transform_continuous
    .clone()
    .unwrap_or_default();

  match operation {
    Operation::Reflect => {
      draw_transform_continuous_reflect_transform(canvas, transform_value, &style)?
    }
    Operation::Rotate => {
      draw_transform_continuous_rotate_transform(canvas, transform_value, &style)?
    }
  }

  canvas.add_component(
    Layer::AnnotationLines,
    Point {
      point: tiling::Point::default(),
      style: style.set_line_dash(&canvas.scale, None),
    }
    .into(),
  )?;

  Ok(())
}

fn draw_transform_continuous_reflect_transform(
  canvas: &mut Canvas<Layer>,
  transform_value: &TransformValue,
  style: &Style,
) -> Result<(), Error> {
  let values = transform_value.get_transform_values();

  for value in &values {
    let has_opposite = values.iter().any(|other| {
      math::coordinate_equals(value - PI, *other) || math::coordinate_equals(value + PI, *other)
    });

    let implicit_line_segment = tiling::LineSegment::default()
      .with_start(tiling::Point::default())
      .with_end(
        tiling::Point::default()
          .with_xy(0.0, -1.0)
          .rotate(value + PI, None),
      );

    if !has_opposite {
      canvas.add_component(
        Layer::AnnotationLines,
        LineSegment {
          points: implicit_line_segment.into(),
          style: style.clone(),
          extend_start: false,
          extend_end: true,
        }
        .into(),
      )?;
    }

    canvas.add_component(
      Layer::AnnotationArrows,
      LineSegmentArrows {
        line_segment: implicit_line_segment,
        style: style.clone(),
        extend_start: false,
        extend_end: true,
        direction: PI * -0.5,
      }
      .into(),
    )?;

    let line_segment = tiling::LineSegment::default()
      .with_start(tiling::Point::default())
      .with_end(
        tiling::Point::default()
          .with_xy(0.0, -1.0)
          .rotate(*value, None),
      );

    canvas.add_component(
      Layer::AnnotationLines,
      LineSegment {
        points: line_segment.into(),
        style: style.set_line_dash(&canvas.scale, None),
        extend_start: false,
        extend_end: true,
      }
      .into(),
    )?;

    canvas.add_component(
      Layer::AnnotationArrows,
      LineSegmentArrows {
        line_segment,
        style: style.clone(),
        extend_start: false,
        extend_end: true,
        direction: PI * 0.5,
      }
      .into(),
    )?;
  }

  Ok(())
}

fn draw_transform_continuous_rotate_transform(
  canvas: &mut Canvas<Layer>,
  transform_value: &TransformValue,
  style: &Style,
) -> Result<(), Error> {
  let radius = canvas
    .content_bbox()
    .get_abs_max_point()
    .distance_to_center();

  let origin = tiling::Point::default();
  let arc_angle_padding = PI * 0.05;
  let mut previous_start_angle = 0.0;

  let line_segment = tiling::LineSegment::default()
    .with_start(tiling::Point::default())
    .with_end(tiling::Point::default().with_xy(0.0, -1.0));

  canvas.add_component(
    Layer::AnnotationLines,
    LineSegment {
      points: line_segment.into(),
      extend_start: false,
      extend_end: true,
      style: style.set_line_dash(&canvas.scale, None),
    }
    .into(),
  )?;

  for value in transform_value.get_transform_values() {
    let line_segment = tiling::LineSegment::default()
      .with_start(tiling::Point::default())
      .with_end(
        tiling::Point::default()
          .with_xy(0.0, -1.0)
          .rotate(value, None),
      );

    canvas.add_component(
      Layer::AnnotationLines,
      LineSegment {
        points: line_segment.into(),
        extend_start: false,
        extend_end: true,
        style: style.set_line_dash(&canvas.scale, None),
      }
      .into(),
    )?;

    canvas.add_component(
      Layer::AnnotationLines,
      Arc {
        point: origin,
        radius,
        start_angle: previous_start_angle + arc_angle_padding,
        end_angle: value.min(PI * 2.0) - arc_angle_padding,
        style: style.set_line_dash(&canvas.scale, None),
      }
      .into(),
    )?;

    previous_start_angle = value;
  }

  Ok(())
}
