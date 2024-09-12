use anyhow::Result;
use tiling::Tiling;

use super::Layer;
use crate::canvas::{Canvas, LineSegment};
use crate::draw::Options;
use crate::Error;

pub fn draw_plane_outline(
  canvas: &mut Canvas,
  options: &Options,
  tiling: &Tiling,
) -> Result<(), Error> {
  for edge in tiling.plane.get_line_segment_edges().iter_values() {
    canvas.add_component(
      Layer::PlaneOutline,
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
