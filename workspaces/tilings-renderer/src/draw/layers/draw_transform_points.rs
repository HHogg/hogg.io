use hogg_tiling_generator::Tiling;

use super::draw_shapes::VAPOR_WAVE_COLOR_PALETTE;
use super::Layer;
use crate::canvas::{Canvas, Point, Style};
use crate::draw::Options;
use crate::Error;

pub fn draw_transform_points(
  canvas: &mut Canvas,
  options: &Options,
  tiling: &Tiling,
) -> Result<(), Error> {
  let style = options.styles.transform_points.clone().unwrap_or_default();

  draw_transform_points_group(
    canvas,
    &style,
    tiling
      .plane
      .point_sequences
      .iter_center_points_primary()
      .map(|point_sequence| point_sequence.center),
    VAPOR_WAVE_COLOR_PALETTE[0],
  )?;

  draw_transform_points_group(
    canvas,
    &style,
    tiling
      .plane
      .point_sequences
      .iter_end_points_primary()
      .map(|point_sequence| point_sequence.center),
    VAPOR_WAVE_COLOR_PALETTE[1],
  )?;

  draw_transform_points_group(
    canvas,
    &style,
    tiling
      .plane
      .point_sequences
      .iter_mid_points_primary()
      .map(|point_sequence| point_sequence.center),
    VAPOR_WAVE_COLOR_PALETTE[2],
  )?;

  draw_transform_points_group(
    canvas,
    &style.set_point_radius(
      &canvas.scale,
      Some(style.get_point_radius(&canvas.scale) * 0.5),
    ),
    tiling
      .plane
      .point_sequences
      .iter_center_points_secondary()
      .map(|point_sequence| point_sequence.center),
    "black",
  )?;

  draw_transform_points_group(
    canvas,
    &style.set_point_radius(
      &canvas.scale,
      Some(style.get_point_radius(&canvas.scale) * 0.5),
    ),
    tiling
      .plane
      .point_sequences
      .iter_end_points_secondary()
      .map(|point_sequence| point_sequence.center),
    "black",
  )?;

  draw_transform_points_group(
    canvas,
    &style.set_point_radius(
      &canvas.scale,
      Some(style.get_point_radius(&canvas.scale) * 0.5),
    ),
    tiling
      .plane
      .point_sequences
      .iter_mid_points_secondary()
      .map(|point_sequence| point_sequence.center),
    "black",
  )?;

  //
  draw_transform_points_group(
    canvas,
    &style.set_point_radius(
      &canvas.scale,
      Some(style.get_point_radius(&canvas.scale) * 0.33),
    ),
    tiling
      .plane
      .point_sequences
      .iter_core_center_complete_point_sequences()
      .map(|point_sequence| point_sequence.center),
    "red",
  )?;

  draw_transform_points_group(
    canvas,
    &style.set_point_radius(
      &canvas.scale,
      Some(style.get_point_radius(&canvas.scale) * 0.33),
    ),
    tiling
      .plane
      .point_sequences
      .iter_core_mid_complete_point_sequences()
      .map(|point_sequence| point_sequence.center),
    "red",
  )?;

  draw_transform_points_group(
    canvas,
    &style.set_point_radius(
      &canvas.scale,
      Some(style.get_point_radius(&canvas.scale) * 0.33),
    ),
    tiling
      .plane
      .point_sequences
      .iter_core_end_complete_point_sequences()
      .map(|point_sequence| point_sequence.center),
    "red",
  )?;

  Ok(())
}

fn draw_transform_points_group(
  canvas: &mut Canvas,
  style: &Style,
  points: impl Iterator<Item = hogg_geometry::Point>,
  color: &str,
) -> Result<(), Error> {
  for point in points {
    canvas.add_component(
      Layer::TransformPoints,
      Point::default()
        .non_interactive()
        .with_point(point)
        .with_style(style.clone().set_fill(Some(color.to_string())))
        .into(),
    )?;
  }

  Ok(())
}
