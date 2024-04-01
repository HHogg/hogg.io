mod extend_line_segment;

use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::{JsError, JsValue};

pub use self::extend_line_segment::extend_line_segment;

#[wasm_bindgen(start)]
fn main() -> Result<(), JsError> {
  std::panic::set_hook(Box::new(console_error_panic_hook::hook));
  console_log::init_with_level(log::Level::Debug).unwrap();

  Ok(())
}

#[wasm_bindgen]
pub fn get_extended_line_segment(
  bounds: JsValue,
  line_segment: JsValue,
  extend_start: bool,
  extend_end: bool,
) -> Result<JsValue, JsError> {
  let (min_x, min_y, max_x, max_y) =
    serde_wasm_bindgen::from_value::<(f64, f64, f64, f64)>(bounds.to_owned())?;
  let (x1, y1, x2, y2) =
    serde_wasm_bindgen::from_value::<(f64, f64, f64, f64)>(line_segment.to_owned())?;

  let extended_line_segment = extend_line_segment(
    x1,
    y1,
    x2,
    y2,
    min_x,
    min_y,
    max_x,
    max_y,
    extend_start,
    extend_end,
  );

  Ok(serde_wasm_bindgen::to_value(&extended_line_segment)?)
}
