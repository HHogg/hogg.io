use anyhow::Result;
use hogg_tiling::Tiling;

use super::Layer;
use crate::canvas::{Canvas, Grid};
use crate::draw::Options;
use crate::Error;

pub fn draw_grid_polygon(
  canvas: &mut Canvas,
  options: &Options,
  tiling: &Tiling,
) -> Result<(), Error> {
  let scaled_spacing = tiling.plane.tiles.get_spacing();

  canvas.add_component(
    Layer::GridPolygon,
    Grid::default()
      .with_size(tiling.plane.tiles.get_grid_size())
      .with_spacing(scaled_spacing)
      .with_style(options.styles.grid.clone().unwrap_or_default())
      .into(),
  )?;

  Ok(())
}
