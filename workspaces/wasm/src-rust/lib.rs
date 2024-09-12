mod circular_sequence;
mod line_segment_extending;
mod tilings;

use std::panic;

use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsError;

#[wasm_bindgen(start)]
fn main() -> Result<(), JsError> {
  console_log::init_with_level(log::Level::Debug).unwrap();
  panic::set_hook(Box::new(console_error_panic_hook::hook));

  Ok(())
}
