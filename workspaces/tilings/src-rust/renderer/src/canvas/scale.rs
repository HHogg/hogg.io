use serde::{Deserialize, Serialize};
use tiling::geometry::BBox;
use typeshare::typeshare;

use crate::Error;

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[typeshare]
pub enum ScaleMode {
  Fixed,
  WithinBounds,
}

impl Default for ScaleMode {
  fn default() -> Self {
    Self::WithinBounds
  }
}

#[derive(Clone, Debug)]
pub struct Scale {
  canvas_bbox: BBox,
  content_bbox: BBox,
  padding: f64,
  auto_rotate: bool,
  mode: ScaleMode,

  scale: f64,
  translate_x: f64,
  translate_y: f64,
  rotate: f64,
}

impl Default for Scale {
  fn default() -> Self {
    Self {
      canvas_bbox: BBox::default(),
      content_bbox: BBox::default(),
      padding: 0.0,
      auto_rotate: false,
      mode: ScaleMode::default(),

      scale: 1.0,
      translate_x: 0.0,
      translate_y: 0.0,
      rotate: 0.0,
    }
  }
}

impl Scale {
  pub fn with_padding(mut self, padding: Option<f64>) -> Self {
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

  /**
   * Canvas value = JS caller value
   * Content value = Scaled canvas value
   *
   * Use this function to convert a value from the
   * canvas space to the content space. Usually called
   * in getting values from a Style object.
   */
  pub fn scale_value_to_content(&self, value: f64) -> f64 {
    value * (1.0 / self.scale)
  }

  /**
   * Canvas value = JS caller value
   * Content value = Scaled canvas value
   *
   * Use this function to convert a value from the
   * content space to the canvas space. Usually called
   * in setting value to store on a Style object.
   */
  pub fn scale_value_to_canvas(&self, value: f64) -> f64 {
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

    // Rotate the content if it's not the same orientation as the canvas.
    self.rotate = if self.auto_rotate
      && ((content_ratio < 1.0 && canvas_ratio > 1.0)
        || (content_ratio > 1.0 && canvas_ratio < 1.0))
    {
      std::f64::consts::FRAC_PI_2
    } else {
      0.0
    };

    let is_zero_size = self.content_bbox.width() == 0.0
      || self.content_bbox.height() == 0.0
      || canvas_width == 0.0
      || canvas_height == 0.0;

    // Scale the content to fit within the canvas.
    self.scale = if self.mode == ScaleMode::Fixed || is_zero_size {
      1.0
    } else if self.rotate == 0.0 {
      (canvas_height / content_height).min(canvas_width / content_width)
    } else {
      (canvas_width / content_height).min(canvas_height / content_width)
    };
  }
}
