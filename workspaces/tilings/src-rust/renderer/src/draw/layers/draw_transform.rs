use anyhow::Result;
use tiling::{Tiling, Transform, TransformContinuous, TransformEccentric};

use super::{draw_transform_continuous, draw_transform_eccentric, Layer};
use crate::canvas::Canvas;
use crate::draw::Options;
use crate::Error;

pub fn draw_transform(
  canvas: &mut Canvas<Layer>,
  options: &Options,
  tiling: &Tiling,
) -> Result<(), Error> {
  // TODO: This should be the index shown on the
  // player. Not the last one in the list.
  let active_transform_index = options
    .active_transform_index
    .unwrap_or(tiling.get_transform_count() as u32 - 1) as usize;

  if let Some(active_transform) = tiling.get_transform(active_transform_index) {
    match &active_transform {
      Transform::Continuous(TransformContinuous { operation, value }) => {
        draw_transform_continuous(canvas, options, operation, value)?
      }
      Transform::Eccentric(TransformEccentric {
        operation,
        origin_index,
        origin_type,
      }) => {
        draw_transform_eccentric(
          canvas,
          options,
          tiling,
          operation,
          origin_type,
          origin_index,
        )?
      }
    }
  }

  Ok(())
}
