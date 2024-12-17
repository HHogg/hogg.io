use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::{JsCast, JsError, JsValue};

use tiling::notation::{Path, Transform};
use tiling::{validation, Tiling};
use tiling_renderer::{draw, Options};
use web_sys::js_sys::Function;
use web_sys::OffscreenCanvas;

#[wasm_bindgen]
pub fn parse_notation(notation: &str) -> Result<JsValue, JsError> {
  Ok(serde_wasm_bindgen::to_value(
    &Tiling::default().from_string(notation.into()),
  )?)
}

#[wasm_bindgen]
pub fn parse_transform(transform: &str, path: &str) -> Result<JsValue, JsError> {
  Ok(serde_wasm_bindgen::to_value(&Transform::from_string(
    transform,
    &Path::default().from_string(path)?,
  )?)?)
}

#[wasm_bindgen]
pub fn find_previous_tiling(
  notation: &str,
  expansion_phases: u8,
  callback: &JsValue,
) -> Result<Option<String>, JsError> {
  let callback = callback.clone().dyn_into::<Function>().map_err(|e| {
    JsError::new(&format!(
      "find_previous_tiling callback conversion failed: {:?}",
      e
    ))
  })?;

  let mut tiling = Tiling::default()
    .with_validations(Some(validation::Flag::all()))
    .with_expansion_phases(expansion_phases)
    .with_link_paths(true)
    .with_notation(notation.to_string());

  Ok(
    tiling
      .find_previous_tiling(Some(&|notation| {
        callback
          .call1(&JsValue::NULL, &JsValue::from_str(&notation))
          .unwrap();
      }))
      .map(|t| t.to_string()),
  )
}

#[wasm_bindgen]
pub fn find_next_tiling(
  notation: &str,
  expansion_phases: u8,
  callback: &JsValue,
) -> Result<Option<String>, JsError> {
  let callback = callback.clone().dyn_into::<Function>().map_err(|e| {
    JsError::new(&format!(
      "find_next_tiling callback conversion failed: {:?}",
      e
    ))
  })?;

  let mut tiling = Tiling::default()
    .with_validations(Some(validation::Flag::all()))
    .with_expansion_phases(expansion_phases)
    .with_link_paths(true)
    .with_notation(notation.to_string());

  Ok(
    tiling
      .find_next_tiling(Some(&|notation| {
        callback
          .call1(&JsValue::NULL, &JsValue::from_str(&notation))
          .unwrap();
      }))
      .map(|t| t.to_string()),
  )
}

#[wasm_bindgen]
pub fn generate_tiling(
  notation: &str,
  expansion_phases: u8,
  validations: &JsValue,
) -> Result<JsValue, JsError> {
  let validations =
    serde_wasm_bindgen::from_value::<Vec<validation::Flag>>(validations.to_owned())?;

  let tiling = Tiling::default()
    .with_validations(Some(validations))
    .with_type_ahead(true)
    .with_expansion_phases(expansion_phases)
    .from_string(notation.to_string());

  Ok(serde_wasm_bindgen::to_value(&tiling)?)
}

#[wasm_bindgen]
pub fn render_tiling(
  canvas: JsValue,
  tiling: &JsValue,
  options: &JsValue,
) -> Result<JsValue, JsError> {
  let offscreen_canvas: OffscreenCanvas = canvas.dyn_into().unwrap();
  let tiling = serde_wasm_bindgen::from_value::<Tiling>(tiling.to_owned())?;
  let options = serde_wasm_bindgen::from_value::<Options>(options.to_owned())?;
  let metrics = draw(&tiling, offscreen_canvas, options)?;

  Ok(serde_wasm_bindgen::to_value(&metrics)?)
}
