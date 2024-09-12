mod layers;
mod options;

use anyhow::Result;
use tiling::build::Metrics;
use tiling::Tiling;
use web_sys::OffscreenCanvas;

use self::layers::{
  draw_axis, draw_grid_line_segment, draw_grid_polygon, draw_plane_outline, draw_shapes,
  draw_transform, draw_vertex_types, Layer,
};
use self::options::Annotation;
pub use self::options::Options;
use crate::canvas::{Canvas, Scale};
use crate::Error;

pub fn draw(
  tiling: &Tiling,
  offscreen_canvas: OffscreenCanvas,
  options: Options,
) -> Result<Metrics, Error> {
  let mut metrics = Metrics::default();

  let scale = Scale::default()
    .with_auto_rotate(options.auto_rotate)
    .with_padding(options.padding)
    .with_mode(options.scale_mode);

  let mut canvas = Canvas::<Layer>::new(offscreen_canvas, scale)?;

  let show_annotations = options.show_annotations.clone().unwrap_or_default();
  let show_debug = options.show_debug.unwrap_or(false);

  if show_debug {
    canvas.draw_debug(&options.styles.debug);
  }

  metrics.start("draw_shapes");
  draw_shapes(&mut canvas, &options, tiling)?;
  metrics.finish("draw_shapes");

  if show_annotations.get(&Annotation::PlaneOutline) == Some(&true) {
    draw_plane_outline(&mut canvas, &options, tiling)?;
  }

  if show_annotations.get(&Annotation::GridLineSegment) == Some(&true) {
    draw_grid_line_segment(&mut canvas, &options, tiling)?;
  }

  if show_annotations.get(&Annotation::GridPolygon) == Some(&true) {
    draw_grid_polygon(&mut canvas, &options, tiling)?;
  }

  if show_annotations.get(&Annotation::AxisOrigin) == Some(&true) {
    draw_axis(&mut canvas, &options, tiling)?;
  }

  if show_annotations.get(&Annotation::Transform) == Some(&true) {
    draw_transform(&mut canvas, &options, tiling)?;
  }

  if show_annotations.get(&Annotation::VertexType) == Some(&true) {
    draw_vertex_types(&mut canvas, &options, tiling)?;
  }

  metrics.start("render");
  canvas.render()?;
  metrics.finish("render");

  Ok(metrics)
}
