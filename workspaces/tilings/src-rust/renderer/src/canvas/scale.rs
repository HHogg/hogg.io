use hogg_geometry::{BBox, ConvexHull};
use hogg_spatial_grid_map::{Fxx, PI_FRAC2};
use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use crate::Error;

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[typeshare]
pub enum ScaleMode {
  Cover,
  Contain,
}

impl Default for ScaleMode {
  fn default() -> Self {
    Self::Contain
  }
}

#[derive(Clone, Debug)]
pub struct Scale {
  pub convex_hull: ConvexHull,

  auto_rotate: bool,
  canvas_bbox: BBox,
  content_bbox: BBox,
  mode: ScaleMode,
  padding: Fxx,

  scale: Fxx,
  translate_x: Fxx,
  translate_y: Fxx,
  rotate: Fxx,

  has_error: bool,
  has_transforms: bool,
}

impl Default for Scale {
  fn default() -> Self {
    Self {
      auto_rotate: false,
      canvas_bbox: BBox::default(),
      content_bbox: BBox::default(),
      convex_hull: ConvexHull::default(),
      mode: ScaleMode::default(),
      padding: 0.0,

      scale: 1.0,
      translate_x: 0.0,
      translate_y: 0.0,
      rotate: 0.0,

      has_error: false,
      has_transforms: false,
    }
  }
}

impl Scale {
  pub fn with_padding(mut self, padding: Option<Fxx>) -> Self {
    self.padding = padding.unwrap_or(0.0);
    self.update();
    self
  }

  pub fn with_mode(mut self, mode: Option<ScaleMode>) -> Self {
    self.mode = mode.unwrap_or_default();
    self.update();
    self
  }

  pub fn with_auto_rotate(mut self, auto_rotate: Option<bool>) -> Self {
    self.auto_rotate = auto_rotate.unwrap_or(false);
    self
  }

  pub fn with_canvas_bbox(mut self, canvas_bbox: BBox) -> Self {
    self.canvas_bbox = canvas_bbox;
    self.update();
    self
  }

  pub fn with_content_bbox(mut self, content_bbox: BBox) -> Self {
    self.content_bbox = content_bbox;
    self.update();
    self
  }

  pub fn with_convex_hull(mut self, convex_hull: ConvexHull) -> Self {
    self.convex_hull = convex_hull;
    self.update();
    self
  }

  pub fn with_has_error(mut self, has_error: bool) -> Self {
    self.has_error = has_error;
    self
  }

  pub fn with_has_transforms(mut self, has_transforms: bool) -> Self {
    self.has_transforms = has_transforms;
    self
  }

  pub fn scale_canvas_context(
    &self,
    ctx: &web_sys::OffscreenCanvasRenderingContext2d,
  ) -> Result<(), Error> {
    ctx.reset_transform()?;

    // Move the origin to the center of the canvas.
    ctx.translate(
      self.canvas_bbox.width() * 0.5,
      self.canvas_bbox.height() * 0.5,
    )?;

    ctx.rotate(self.rotate)?;
    ctx.scale(self.scale, self.scale)?;
    ctx.translate(self.translate_x, self.translate_y)?;

    Ok(())
  }

  /// Canvas value = JS caller value
  /// Content value = Scaled canvas value
  ///
  /// Use this function to convert a value from the
  /// canvas space to the content space. Usually called
  /// in getting values from a Style object.
  pub fn scale_value_to_content(&self, value: Fxx) -> Fxx {
    value * (1.0 / self.scale)
  }

  /// Canvas value = JS caller value
  /// Content value = Scaled canvas value
  ///
  /// Use this function to convert a value from the
  /// content space to the canvas space. Usually called
  /// in setting value to store on a Style object.
  pub fn scale_value_to_canvas(&self, value: Fxx) -> Fxx {
    value * self.scale
  }

  pub fn scaled_canvas_bbox(&self) -> BBox {
    BBox::default()
      .with_width(self.scale_value_to_content(self.canvas_bbox.width()))
      .with_height(self.scale_value_to_content(self.canvas_bbox.height()))
      .translate(-0.5, -0.5)
  }

  fn update(&mut self) {
    let canvas_height = self.canvas_bbox.height();
    let canvas_width = self.canvas_bbox.width();
    let canvas_ratio = self.canvas_bbox.ratio();
    let content_ratio = self.content_bbox.ratio();
    let content_centroid = self.content_bbox.centroid();
    let content_height = self.content_bbox.height();
    let content_width = self.content_bbox.width();

    // Shift the content to the center of the canvas.
    self.translate_x = -content_centroid.x;
    self.translate_y = -content_centroid.y;

    // If the canvas or content dimensions haven't been set yet,
    // we can't calculate the scale.
    if canvas_height == 0.0 || canvas_width == 0.0 || content_height == 0.0 || content_width == 0.0
    {
      return;
    }

    // Rotate the content if it's not the same orientation as the canvas.
    self.rotate = if self.auto_rotate
      && ((content_ratio < 1.0 && canvas_ratio > 1.0)
        || (content_ratio > 1.0 && canvas_ratio < 1.0))
    {
      PI_FRAC2
    } else {
      0.0
    };

    let contain_scale = if self.rotate == 0.0 {
      (canvas_height / content_height).min(canvas_width / content_width)
    } else {
      (canvas_width / content_height).min(canvas_height / content_width)
    };

    if self.has_error || !self.has_transforms {
      self.scale = contain_scale;
    } else {
      self.scale = match self.mode {
        // Scale the content to fit within the canvas.
        ScaleMode::Contain => contain_scale,
        // Scale the content to cover the canvas.
        ScaleMode::Cover => self
          .convex_hull
          .rotate(self.rotate, None)
          .get_bbox_scale_value(&self.canvas_bbox),
      };
    }
  }
}
