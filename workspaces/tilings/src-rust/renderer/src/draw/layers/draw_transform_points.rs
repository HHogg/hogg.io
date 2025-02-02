use spatial_grid_map::location;
use tiling::Tiling;

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
    tiling.plane.points_center.iter_points(),
    VAPOR_WAVE_COLOR_PALETTE[0],
  )?;

  draw_transform_points_group(
    canvas,
    &style,
    tiling.plane.points_end.iter_points(),
    VAPOR_WAVE_COLOR_PALETTE[1],
  )?;

  draw_transform_points_group(
    canvas,
    &style,
    tiling.plane.points_mid.iter_points(),
    VAPOR_WAVE_COLOR_PALETTE[2],
  )?;

  draw_transform_points_group(
    canvas,
    &style.set_point_radius(
      &canvas.scale,
      Some(style.get_point_radius(&canvas.scale) * 0.5),
    ),
    tiling.plane.points_center_extended.iter_points(),
    "black",
  )?;

  draw_transform_points_group(
    canvas,
    &style.set_point_radius(
      &canvas.scale,
      Some(style.get_point_radius(&canvas.scale) * 0.5),
    ),
    tiling.plane.points_end_extended.iter_points(),
    "black",
  )?;

  draw_transform_points_group(
    canvas,
    &style.set_point_radius(
      &canvas.scale,
      Some(style.get_point_radius(&canvas.scale) * 0.5),
    ),
    tiling.plane.points_mid_extended.iter_points(),
    "black",
  )?;

  Ok(())
}

fn draw_transform_points_group<'a>(
  canvas: &mut Canvas,
  style: &Style,
  points: impl Iterator<Item = &'a location::Point>,
  color: &str,
) -> Result<(), Error> {
  for point in points {
    canvas.add_component(
      Layer::TransformPoints,
      Point::default()
        .non_interactive()
        .with_point((*point).into())
        .with_style(style.clone().set_fill(Some(color.to_string())))
        .into(),
    )?;
  }

  Ok(())
}
