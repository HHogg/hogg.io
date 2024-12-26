use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::{JsCast, JsError, JsValue};

use tiling::notation::{Path, Transform};
use tiling::{validation, Tiling};
use tiling_renderer::{draw, Options};
use web_sys::OffscreenCanvas;

use crate::events::{post_event, WasmWorkerEvent};

#[wasm_bindgen]
pub fn parse_notation(notation: &str) -> Result<JsValue, JsError> {
  Ok(serde_wasm_bindgen::to_value(
    &Tiling::default().from_string(notation),
  )?)
}

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
  expansion_phases: u8,
) -> Result<Option<String>, JsError> {
  let mut tiling = Tiling::default()
    .with_expansion_phases(expansion_phases)
    .with_first_transform()
    .with_link_paths()
    .with_validations(Some(validation::Flag::all()))
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
pub fn find_next_tiling(notation: &str, expansion_phases: u8) -> Result<Option<String>, JsError> {
  let mut tiling = Tiling::default()
    .with_expansion_phases(expansion_phases)
    .with_first_transform()
    .with_link_paths()
    .with_validations(Some(validation::Flag::all()))
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
  expansion_phases: u8,
  options: &JsValue,
) -> Result<(), JsError> {
  let offscreen_canvas: OffscreenCanvas = canvas.dyn_into().unwrap();
  let options = serde_wasm_bindgen::from_value::<Options>(options.to_owned())?;

  let tiling = Tiling::default()
    .with_validations(None)
    .with_expansion_phases(expansion_phases)
    .from_string(notation);

  draw(&tiling, &offscreen_canvas, &options)?;

  Ok(())
}
