mod canvas;
mod draw;
mod error;
use std::panic;

use tiling::{Tiling, ValidationFlag};
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::{JsError, JsValue};

use self::draw::{draw, Options};
pub use self::error::Error;

#[wasm_bindgen(start)]
fn main() -> Result<(), JsError> {
  panic::set_hook(Box::new(console_error_panic_hook::hook));
  console_log::init_with_level(log::Level::Debug).unwrap();

  Ok(())
}

#[wasm_bindgen]
pub fn render_notation(
  canvas_id: &str,
  notation: &str,
  options: &JsValue,
) -> Result<JsValue, JsError> {
  let options = serde_wasm_bindgen::from_value::<Options>(options.to_owned())?;

  let tiling = Tiling::default()
    .with_validations(Some(ValidationFlag::all()))
    .with_scale(options.scale_size.unwrap_or(1))
    .with_type_ahead(true)
    .with_expansion_phases(options.expansion_phases.unwrap_or_default())
    .from_string(notation.to_string());

  draw(&tiling, canvas_id, options)?;

  Ok(serde_wasm_bindgen::to_value(&tiling)?)
}
