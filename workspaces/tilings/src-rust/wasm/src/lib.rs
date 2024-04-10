use std::panic;

use tiling::{Path, Tiling, Transform, ValidationFlag};
use tiling_renderer::{draw, Options};
use wasm_bindgen::prelude::*;

#[wasm_bindgen(start)]
fn main() -> Result<(), JsError> {
  console_log::init_with_level(log::Level::Debug).unwrap();
  panic::set_hook(Box::new(console_error_panic_hook::hook));

  Ok(())
}

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
  validations: &JsValue,
) -> Result<Option<String>, JsError> {
  let validations = serde_wasm_bindgen::from_value::<Vec<ValidationFlag>>(validations.to_owned())?;

  let mut tiling = Tiling::default()
    .with_validations(Some(validations))
    .with_expansion_phases(3)
    .with_link_paths(true)
    .from_string(notation.to_string());

  Ok(tiling.find_previous_tiling().map(|t| t.to_string()))
}

#[wasm_bindgen]
pub fn find_next_tiling(notation: &str, validations: &JsValue) -> Result<Option<String>, JsError> {
  let validations = serde_wasm_bindgen::from_value::<Vec<ValidationFlag>>(validations.to_owned())?;

  let mut tiling = Tiling::default()
    .with_validations(Some(validations))
    .with_expansion_phases(3)
    .with_link_paths(true)
    .from_string(notation.to_string());

  Ok(tiling.find_next_tiling().map(|t| t.to_string()))
}

#[wasm_bindgen]
pub fn render_notation(
  canvas_id: &str,
  notation: &str,
  options: &JsValue,
  validations: &JsValue,
) -> Result<JsValue, JsError> {
  let options = serde_wasm_bindgen::from_value::<Options>(options.to_owned())?;
  let validations = serde_wasm_bindgen::from_value::<Vec<ValidationFlag>>(validations.to_owned())?;

  let tiling = Tiling::default()
    .with_validations(Some(validations))
    .with_scale(options.scale_size.unwrap_or(1))
    .with_type_ahead(true)
    .with_expansion_phases(options.expansion_phases.unwrap_or_default())
    .from_string(notation.to_string());

  draw(&tiling, canvas_id, options)?;

  Ok(serde_wasm_bindgen::to_value(&tiling)?)
}
