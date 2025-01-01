mod circular_sequence;
mod events;
mod line_segment_extending;
mod render_loop;
mod tilings;

use std::panic;

pub use events::WasmWorkerEvent;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsError;

#[wasm_bindgen(start)]
fn main() -> Result<(), JsError> {
  console_log::init_with_level(log::Level::Debug).expect("Failed to initialize logger");
  panic::set_hook(Box::new(console_error_panic_hook::hook));

  Ok(())
}
