use spatial_grid_map::{location, ResizeMethod, SpatialGridMap};
use tiling::geometry::BBox;

use super::component::{Component, Draw};
use super::Scale;

pub struct Theia {
  components: SpatialGridMap<BBox>,
}

impl Theia {
  pub fn new() -> Self {
    Self {
      components: SpatialGridMap::new("components").with_resize_method(ResizeMethod::Maximum),
    }
  }

  pub fn has_collision(
    &mut self,
    context: &web_sys::OffscreenCanvasRenderingContext2d,
    canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
    a: &Component,
  ) -> bool {
    if a.interactive() == Some(false) {
      return false;
    }

    let a_bbox = a.inner().bbox(context, canvas_bbox, content_bbox, scale);
    let a_centroid: location::Point = a_bbox.centroid().into();
    let a_size = a_bbox.height().max(a_bbox.width());

    let nearby_boxes = self.components.iter_values_around(&a_centroid, 1);

    for b_bbox in nearby_boxes {
      if a_bbox == *b_bbox {
        continue;
      }

      if a_bbox.intersects(b_bbox) {
        return true;
      }
    }

    self.components.insert(a_centroid, a_size, None, a_bbox);

    false
  }
}
