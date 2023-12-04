use std::panic;

use tiling::{Path, Tiling, Transform};
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
