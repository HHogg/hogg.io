use anyhow::Result;

use super::Layer;
use crate::canvas::{Canvas, LineSegment};
use crate::draw::Options;
use crate::Error;

pub fn draw_convex_hull(canvas: &mut Canvas, options: &Options) -> Result<(), Error> {
  let points = &canvas.scale.convex_hull.points;
  let mut line_segments = Vec::new();

  for index in 0..points.len() {
    let next_index = (index + 1) % points.len();

    line_segments.push(
      tiling::geometry::LineSegment::default()
        .with_start(points[index])
        .with_end(points[next_index]),
    );
  }

  for edge in line_segments.iter() {
    canvas.add_component(
      Layer::ConvexHull,
      LineSegment::default()
        .non_interactive()
        .with_points((*edge).into())
        .with_extend_start(false)
        .with_extend_end(false)
        .with_style(options.styles.plane_outline.clone().unwrap_or_default())
        .into(),
    )?;
  }

  Ok(())
}
