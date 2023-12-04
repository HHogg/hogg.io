use anyhow::Result;
use tiling::Tiling;

use super::Layer;
use crate::canvas::{Canvas, LineSegment};
use crate::draw::Options;
use crate::Error;

pub fn draw_axis(
  canvas: &mut Canvas<Layer>,
  options: &Options,
  tiling: &Tiling,
) -> Result<(), Error> {
  let style = options.styles.axis.clone().unwrap_or_default();
  let size = tiling
    .polygons
    .seed_polygon
    .as_ref()
    .map(|p| p.bbox.radius())
    .unwrap_or(1.0);

  let line_segment_x = tiling::LineSegment::default()
    .with_start(tiling::Point::default().with_xy(size * -1.0, 0.0))
    .with_end(tiling::Point::default().with_xy(size, 0.0));

  let line_segment_y = tiling::LineSegment::default()
    .with_start(tiling::Point::default().with_xy(0.0, size * -1.0))
    .with_end(tiling::Point::default().with_xy(0.0, size));

  canvas.add_component(
    Layer::AnnotationLines,
    LineSegment {
      points: line_segment_x.into(),
      style: style.set_line_dash(&canvas.scale, None),
      extend_start: false,
      extend_end: false,
    }
    .into(),
  )?;

  canvas.add_component(
    Layer::AnnotationLines,
    LineSegment {
      points: line_segment_y.into(),
      style: style.clone(),
      extend_start: false,
      extend_end: false,
    }
    .into(),
  )?;

  Ok(())
}
