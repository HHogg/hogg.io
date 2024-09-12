use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use crate::canvas::{ScaleMode, Style};

use super::layers::Layer;

#[derive(Clone, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Options {
  pub auto_rotate: Option<bool>,
  pub color_mode: Option<ColorMode>,
  pub is_valid: Option<bool>,
  pub max_stage: Option<u16>,
  pub padding: Option<f64>,
  pub scale_mode: Option<ScaleMode>,
  pub scale_size: Option<u8>,
  pub show_layers: Option<HashMap<Layer, bool>>,
  pub show_transform_index: Option<u32>,
  pub styles: Styles,
}

#[derive(Clone, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Styles {
  pub axis: Option<Style>,
  pub bounding_boxes: Option<Style>,
  pub grid: Option<Style>,
  pub plane_outline: Option<Style>,
  pub shape: Option<Style>,
  pub transform_continuous: Option<Style>,
  pub transform_eccentric: Option<Style>,
  pub transform_points: Option<Style>,
}

#[derive(Clone, Deserialize, Serialize)]
#[typeshare]
pub enum ColorMode {
  BlackAndWhite,
  None,
  Validity,
  VaporWave,
  VaporWaveRandom,
}

impl Default for ColorMode {
  fn default() -> Self {
    Self::VaporWaveRandom
  }
}
