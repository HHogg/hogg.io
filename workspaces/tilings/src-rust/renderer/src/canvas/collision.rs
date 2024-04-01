use tiling::BBox;

use super::component::{Component, Draw};
use super::Scale;
use crate::Error;

pub struct Theia {
  components: Vec<Component>,
}

impl Theia {
  pub fn new() -> Self {
    Self {
      components: Vec::new(),
    }
  }

  pub fn has_collision(
    &mut self,
    context: &web_sys::CanvasRenderingContext2d,
    canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
    a: &Component,
  ) -> Result<bool, Error> {
    for b in self.components.iter() {
      if a.bbox(context, canvas_bbox, content_bbox, scale)?
        == b.bbox(context, canvas_bbox, content_bbox, scale)?
      {
        continue;
      }

      if a.collides_with(context, canvas_bbox, content_bbox, scale, b)? {
        return Ok(true);
      }
    }

    self.components.push(a.clone());

    Ok(false)
  }
}
