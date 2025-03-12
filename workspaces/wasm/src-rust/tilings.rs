use std::collections::HashMap;

use hogg_tiling_generator::notation::{Path, Transform};
use hogg_tiling_generator::{FeatureToggle, Tiling};
use hogg_tiling_renderer::{draw, Options};
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::{JsCast, JsError, JsValue};
use web_sys::OffscreenCanvas;

use crate::events::{post_event, WasmWorkerEvent};

#[wasm_bindgen]
pub fn parse_transform(transform: &str, path: &str) -> Result<JsValue, JsError> {
  Ok(serde_wasm_bindgen::to_value(&Transform::from_string(
    transform,
    &Path::default().from_string(path, false)?,
  )?)?)
}

#[wasm_bindgen]
pub fn find_previous_tiling(
  notation: &str,
  repetitions: u8,
  feature_toggles: &JsValue,
) -> Result<Option<String>, JsError> {
  let feature_toggles = serde_wasm_bindgen::from_value::<Option<HashMap<FeatureToggle, bool>>>(
    feature_toggles.to_owned(),
  )?;

  let mut tiling = Tiling::default()
    .with_repetitions(repetitions)
    .with_first_transform()
    .with_link_paths()
    .with_feature_toggles(feature_toggles)
    .with_notation(notation);

  Ok(
    tiling
      .find_previous_tiling(Some(&|result| {
        post_event(WasmWorkerEvent::FindPreviousTiling(result.notation.clone()));
      }))?
      .map(|t| t.to_string()),
  )
}

#[wasm_bindgen]
pub fn find_next_tiling(
  notation: &str,
  repetitions: u8,
  feature_toggles: &JsValue,
) -> Result<Option<String>, JsError> {
  let feature_toggles = serde_wasm_bindgen::from_value::<Option<HashMap<FeatureToggle, bool>>>(
    feature_toggles.to_owned(),
  )?;

  let mut tiling = Tiling::default()
    .with_repetitions(repetitions)
    .with_first_transform()
    .with_link_paths()
    .with_feature_toggles(feature_toggles)
    .with_notation(notation);

  Ok(
    tiling
      .find_next_tiling(Some(&|result| {
        post_event(WasmWorkerEvent::FindNextTiling(result.notation.clone()));
      }))?
      .map(|result| result.notation.clone()),
  )
}

#[wasm_bindgen]
pub fn render_tiling(
  canvas: JsValue,
  notation: &str,
  repetitions: u8,
  feature_toggles: &JsValue,
  options: &JsValue,
) -> Result<(), JsError> {
  let offscreen_canvas: OffscreenCanvas = canvas.dyn_into().expect("Failed to convert canvas");
  let feature_toggles = serde_wasm_bindgen::from_value::<Option<HashMap<FeatureToggle, bool>>>(
    feature_toggles.to_owned(),
  )?;

  let options = serde_wasm_bindgen::from_value::<Options>(options.to_owned())?;
  let tiling = Tiling::default()
    .with_repetitions(repetitions)
    .with_feature_toggles(feature_toggles)
    .with_type_ahead()
    .from_string(notation);

  draw(&tiling, &offscreen_canvas, &options)?;

  Ok(())
}
