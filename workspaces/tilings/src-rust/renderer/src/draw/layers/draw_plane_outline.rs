use anyhow::Result;
use tiling::Tiling;

use super::Layer;
use crate::canvas::{Canvas, LineSegment};
use crate::draw::Options;
use crate::Error;

pub fn draw_plane_outline(
  canvas: &mut Canvas<Layer>,
  options: &Options,
  tiling: &Tiling,
) -> Result<(), Error> {
  let scale = options.scale_size.unwrap_or(1) as f64;

  for edge in tiling.plane.get_line_segment_edges().iter_values() {
    canvas.add_component(
      Layer::PlaneOutline,
      LineSegment {
        points: [edge.p1.scale(scale), edge.p2.scale(scale)].to_vec(),
        extend_start: false,
        extend_end: false,
        style: options.styles.plane_outline.clone().unwrap_or_default(),
      }
      .into(),
    )?;
  }

  Ok(())
}
