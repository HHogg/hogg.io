mod layers;
mod options;

use anyhow::Result;
use tiling::build::Metrics;
use tiling::Tiling;
use web_sys::OffscreenCanvas;

pub use self::layers::Layer;
use self::layers::{
  draw_axis, draw_grid_line_segment, draw_grid_polygon, draw_plane_outline, draw_shapes,
  draw_transform, draw_transform_points,
};
pub use self::options::Options;
use crate::canvas::Canvas;
use crate::Error;

pub fn draw(
  tiling: &Tiling,
  offscreen_canvas: OffscreenCanvas,
  options: Options,
) -> Result<Metrics, Error> {
  let mut metrics = Metrics::default();
  let mut canvas = Canvas::new(offscreen_canvas, &options)?;

  let show_layers = options.show_layers.clone().unwrap_or_default();

  metrics.start("draw");
  draw_shapes(&mut canvas, &options, tiling)?;

  if show_layers.get(&Layer::Axis) == Some(&true) {
    draw_axis(&mut canvas, &options)?;
  }

  if show_layers.get(&Layer::PlaneOutline) == Some(&true) {
    draw_plane_outline(&mut canvas, &options, tiling)?;
  }

  if show_layers.get(&Layer::GridLineSegment) == Some(&true) {
    draw_grid_line_segment(&mut canvas, &options, tiling)?;
  }

  if show_layers.get(&Layer::GridPolygon) == Some(&true) {
    draw_grid_polygon(&mut canvas, &options, tiling)?;
  }

  if show_layers.get(&Layer::TransformPoints) == Some(&true) {
    draw_transform_points(&mut canvas, &options, tiling)?;
  }

  if show_layers.get(&Layer::Transform) == Some(&true) {
    draw_transform(&mut canvas, &options, tiling)?;
  }

  metrics.finish("draw");

  metrics.start("render");
  canvas.render()?;
  metrics.finish("render");

  Ok(metrics)
}
