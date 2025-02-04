use anyhow::Result;

use super::Layer;
use crate::canvas::{Canvas, LineSegment, Point};
use crate::draw::Options;
use crate::Error;

pub fn draw_axis(canvas: &mut Canvas, options: &Options) -> Result<(), Error> {
  let style = options.styles.axis.clone().unwrap_or_default();

  canvas.add_component(
    Layer::Axis,
    Point::default()
      .non_interactive()
      .with_point(hogg_geometry::Point::default())
      .with_style(style.clone())
      .into(),
  )?;

  canvas.add_component(
    Layer::Axis,
    LineSegment::default()
      .non_interactive()
      .with_points(
        hogg_geometry::LineSegment::default()
          .with_start(hogg_geometry::Point::at(-0.5, 0.0))
          .with_end(hogg_geometry::Point::at(-1.0, 0.0))
          .into(),
      )
      .with_style(style.clone())
      .with_extend_end(true)
      .into(),
  )?;

  canvas.add_component(
    Layer::Axis,
    LineSegment::default()
      .non_interactive()
      .with_points(
        hogg_geometry::LineSegment::default()
          .with_start(hogg_geometry::Point::at(0.5, 0.0))
          .with_end(hogg_geometry::Point::at(1.0, 0.0))
          .into(),
      )
      .with_style(style.clone())
      .with_extend_end(true)
      .into(),
  )?;

  canvas.add_component(
    Layer::Axis,
    LineSegment::default()
      .non_interactive()
      .with_points(
        hogg_geometry::LineSegment::default()
          .with_start(hogg_geometry::Point::at(0.0, -0.5))
          .with_end(hogg_geometry::Point::at(0.0, -1.0))
          .into(),
      )
      .with_style(style.clone())
      .with_extend_end(true)
      .into(),
  )?;

  canvas.add_component(
    Layer::Axis,
    LineSegment::default()
      .non_interactive()
      .with_points(
        hogg_geometry::LineSegment::default()
          .with_start(hogg_geometry::Point::at(0.0, 0.5))
          .with_end(hogg_geometry::Point::at(0.0, 1.0))
          .into(),
      )
      .with_style(style.clone())
      .with_extend_end(true)
      .into(),
  )?;

  Ok(())
}
