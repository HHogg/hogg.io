use tiling::Tiling;

use super::draw_shapes::VAPOR_WAVE_COLOR_PALETTE;
use super::Layer;
use crate::canvas::{Canvas, Point};
use crate::draw::Options;
use crate::Error;

pub fn draw_vertex_types(
  canvas: &mut Canvas<Layer>,
  options: &Options,
  tiling: &Tiling,
) -> Result<(), Error> {
  let style = options.styles.vertex_type.clone().unwrap_or_default();

  for polygon in tiling.plane.iter() {
    if let Some(max_stage) = options.max_stage {
      if polygon.stage_index > max_stage {
        continue;
      }
    }

    for point in polygon.points.iter() {
      point.vertex_type.map(|vertex_type| {
        canvas.add_component(
          Layer::AnnotationPoints,
          Point {
            point: *point,
            style: style.clone().set_fill(
              VAPOR_WAVE_COLOR_PALETTE
                .get(vertex_type as usize)
                .map(|s| s.to_string()),
            ),
          }
          .into(),
        )
      });
    }
  }

  Ok(())
}
