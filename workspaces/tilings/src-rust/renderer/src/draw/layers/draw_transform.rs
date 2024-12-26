use anyhow::Result;
use tiling::notation::{Transform, TransformContinuous, TransformEccentric};
use tiling::{build, Tiling};

use super::{draw_transform_continuous, draw_transform_eccentric};
use crate::canvas::Canvas;
use crate::draw::Options;
use crate::Error;

pub fn draw_transform(
  canvas: &mut Canvas,
  options: &Options,
  tiling: &Tiling,
) -> Result<(), Error> {
  let max_stage = options.max_stage.unwrap_or(0);
  let transform_index = if let Some(index) = options.show_transform_index {
    Some(index)
  } else if let Some(build::Stage::Transform(index)) = tiling.plane.stages.get(max_stage as usize) {
    Some(*index)
  } else {
    None
  };

  if let Some(index) = transform_index {
    if let Some(active_transform) = tiling.notation.get_transform(index as usize) {
      match &active_transform {
        Transform::Continuous(TransformContinuous { operation, value }) => {
          draw_transform_continuous(canvas, options, operation, value)?
        }
        Transform::Eccentric(TransformEccentric {
          operation,
          origin_index,
          origin_type,
        }) => draw_transform_eccentric(
          canvas,
          options,
          tiling,
          operation,
          origin_type,
          origin_index,
        )?,
      }
    }
  }

  Ok(())
}
