mod layers;
mod options;

use anyhow::Result;
use tiling::Tiling;

use self::layers::{draw_axis, draw_shapes, draw_transform, draw_vertex_types, Layer};
use self::options::Annotation;
pub use self::options::Options;
use crate::canvas::{Canvas, Scale};
use crate::Error;

pub fn draw(tiling: &Tiling, canvas_id: &str, options: Options) -> Result<(), Error> {
  let scale = Scale::default()
    .with_auto_rotate(options.auto_rotate)
    .with_padding(options.padding)
    .with_mode(options.scale_mode);

  let mut canvas = Canvas::<Layer>::new(canvas_id, scale)?;

  let show_annotations = options.show_annotations.clone().unwrap_or_default();
  let show_debug = options.show_debug.unwrap_or(false);

  if show_debug {
    canvas.draw_debug(&options.styles.debug);
  }

  draw_shapes(&mut canvas, &options, tiling)?;

  if show_annotations.get(&Annotation::AxisOrigin) == Some(&true) {
    draw_axis(&mut canvas, &options, tiling)?;
  }

  if show_annotations.get(&Annotation::Transform) == Some(&true) {
    draw_transform(&mut canvas, &options, tiling)?;
  }

  if show_annotations.get(&Annotation::VertexType) == Some(&true) {
    draw_vertex_types(&mut canvas, &options, tiling)?;
  }

  canvas.render()?;

  Ok(())
}
