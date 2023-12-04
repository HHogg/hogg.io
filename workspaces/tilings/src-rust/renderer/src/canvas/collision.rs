use tiling::BBox;

use super::component::{Component, Draw};
use super::Scale;

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
    canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
    a: &Component,
  ) -> bool {
    for b in self.components.iter() {
      if a == b {
        continue;
      }

      if a.collides_with(canvas_bbox, content_bbox, scale, b) {
        return true;
      }
    }

    self.components.push(a.clone());

    false
  }
}
