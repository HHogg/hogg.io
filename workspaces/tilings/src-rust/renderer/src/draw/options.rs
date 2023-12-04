use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use crate::canvas::{ScaleMode, Style};

#[derive(Clone, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Options {
  pub active_transform_index: Option<u32>,
  pub auto_rotate: Option<bool>,
  pub color_mode: Option<ColorMode>,
  pub expansion_phases: Option<u8>,
  pub is_valid: Option<bool>,
  pub max_stage: Option<u16>,
  pub padding: Option<f64>,
  pub scale_mode: Option<ScaleMode>,
  pub scale_size: Option<u8>,
  pub show_annotations: Option<HashMap<Annotation, bool>>,
  pub show_debug: Option<bool>,
  pub styles: Styles,
}

#[derive(Clone, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Styles {
  pub axis: Option<Style>,
  pub debug: Option<Style>,
  pub grid: Option<Style>,
  pub shape: Option<Style>,
  pub transform_continuous: Option<Style>,
  pub transform_eccentric: Option<Style>,
  pub vertex_type: Option<Style>,
}

#[derive(Clone, Deserialize, Hash, PartialEq, Eq, Serialize)]
#[typeshare]
pub enum Annotation {
  AxisOrigin,
  Transform,
  VertexType,
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
