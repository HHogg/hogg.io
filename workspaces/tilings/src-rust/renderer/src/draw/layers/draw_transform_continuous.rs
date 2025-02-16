use hogg_spatial_grid_map::utils::coordinate_equals;
use hogg_spatial_grid_map::PI;
use hogg_tiling::notation::{Operation, TransformValue};

use super::Layer;
use crate::canvas::{ArcArrow, Canvas, LineSegment, LineSegmentArrows, Point, Style};
use crate::draw::Options;
use crate::Error;

pub fn draw_transform_continuous(
  canvas: &mut Canvas,
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
    Layer::Transform,
    Point::default()
      .with_point(hogg_geometry::Point::default())
      .with_style(style.set_line_dash(&canvas.scale, None))
      .into(),
  )?;

  Ok(())
}

fn draw_transform_continuous_reflect_transform(
  canvas: &mut Canvas,
  transform_value: &TransformValue,
  style: &Style,
) -> Result<(), Error> {
  let values = transform_value.get_transform_values();

  for value in &values {
    let has_opposite = values
      .iter()
      .any(|other| coordinate_equals(value - PI, *other) || coordinate_equals(value + PI, *other));

    let implicit_line_segment = hogg_geometry::LineSegment::default()
      .with_start(hogg_geometry::Point::at(0.0, -2.0).rotate(value + PI, None))
      .with_end(hogg_geometry::Point::at(0.0, -3.0).rotate(value + PI, None));

    if !has_opposite {
      canvas.add_component(
        Layer::Transform,
        LineSegment::default()
          .with_points(implicit_line_segment.into())
          .with_style(style.clone())
          .with_extend_start(false)
          .with_extend_end(true)
          .into(),
      )?;
    }

    let line_segment = hogg_geometry::LineSegment::default()
      .with_start(hogg_geometry::Point::at(0.0, -2.0).rotate(*value, None))
      .with_end(hogg_geometry::Point::at(0.0, -3.0).rotate(*value, None));

    canvas.add_component(
      Layer::Transform,
      LineSegment::default()
        .with_points(line_segment.into())
        .with_style(style.set_line_dash(&canvas.scale, None))
        .with_extend_start(false)
        .with_extend_end(true)
        .into(),
    )?;

    canvas.add_component(
      Layer::Transform,
      LineSegmentArrows::default()
        .with_line_segment(line_segment)
        .with_style(style.clone())
        .with_extend_start(true)
        .with_extend_end(true)
        .with_direction(PI * 0.5)
        .into(),
    )?;
  }

  Ok(())
}

fn draw_transform_continuous_rotate_transform(
  canvas: &mut Canvas,
  transform_value: &TransformValue,
  style: &Style,
) -> Result<(), Error> {
  let radius = canvas.content_bbox().radius_min();
  let origin = hogg_geometry::Point::default();
  let arc_angle_padding = PI * 0.05;
  let mut previous_start_angle = 0.0;

  canvas.add_component(
    Layer::Transform,
    LineSegment::default()
      .with_points(
        hogg_geometry::LineSegment::default()
          .with_start(hogg_geometry::Point::at(0.0, -2.0))
          .with_end(hogg_geometry::Point::at(0.0, -3.0))
          .into(),
      )
      .with_extend_start(false)
      .with_extend_end(true)
      .with_style(style.set_line_dash(&canvas.scale, None))
      .into(),
  )?;

  for value in transform_value.get_transform_values() {
    let line_segment = hogg_geometry::LineSegment::default()
      .with_start(hogg_geometry::Point::at(0.0, -2.0).rotate(value, None))
      .with_end(hogg_geometry::Point::at(0.0, -3.0).rotate(value, None));

    canvas.add_component(
      Layer::Transform,
      LineSegment::default()
        .with_points(line_segment.into())
        .with_extend_start(false)
        .with_extend_end(true)
        .with_style(style.set_line_dash(&canvas.scale, None))
        .into(),
    )?;

    canvas.add_component(
      Layer::Transform,
      ArcArrow::default()
        .with_point(origin)
        .with_radius(radius)
        .with_start_angle(previous_start_angle + arc_angle_padding)
        .with_end_angle(value.min(PI * 2.0) - arc_angle_padding)
        .with_style(style.set_line_dash(&canvas.scale, None))
        .into(),
    )?;

    previous_start_angle = value;
  }

  canvas.add_component(
    Layer::Transform,
    ArcArrow::default()
      .non_interactive()
      .with_point(origin)
      .with_radius(radius)
      .with_start_angle(previous_start_angle + arc_angle_padding)
      .with_end_angle(PI * 2.0 - arc_angle_padding)
      .with_style(style.set_line_dash(&canvas.scale, None))
      .into(),
  )?;

  Ok(())
}
