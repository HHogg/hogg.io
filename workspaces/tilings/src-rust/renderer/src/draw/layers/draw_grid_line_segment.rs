use anyhow::Result;
use tiling::Tiling;

use super::Layer;
use crate::canvas::{Canvas, Grid};
use crate::draw::Options;
use crate::Error;

pub fn draw_grid_line_segment(
  canvas: &mut Canvas<Layer>,
  options: &Options,
  tiling: &Tiling,
) -> Result<(), Error> {
  let scaled_spacing =
    (tiling.plane.line_segments.spacing as f64) * options.scale_size.unwrap_or_default() as f64;

  canvas.add_component(
    Layer::GridLineSegment,
    Grid {
      size: tiling.plane.line_segments.get_grid_size(),
      spacing: scaled_spacing,
      style: options.styles.grid.clone().unwrap_or_default(),
    }
    .into(),
  )?;

  Ok(())
}
