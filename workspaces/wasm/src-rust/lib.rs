mod circular_sequence;
mod line_segment_extending;
mod tilings;

use std::panic;

use serde_wasm_bindgen::from_value;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::{JsCast, JsError, JsValue};
use web_sys::OffscreenCanvas;

#[wasm_bindgen(start)]
fn main() -> Result<(), JsError> {
  console_log::init_with_level(log::Level::Debug).unwrap();
  panic::set_hook(Box::new(console_error_panic_hook::hook));

  Ok(())
}
