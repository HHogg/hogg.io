mod extend_line_segment;

use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::{JsError, JsValue};

pub use self::extend_line_segment::{extend_line_segment, X1Y1X2Y2};

#[wasm_bindgen]
pub fn get_extended_line_segment(
  line_segment: JsValue,
  bounds: JsValue,
  extend_start: bool,
  extend_end: bool,
) -> Result<JsValue, JsError> {
  let line_segment = serde_wasm_bindgen::from_value::<X1Y1X2Y2>(line_segment.to_owned())?;
  let bounds = serde_wasm_bindgen::from_value::<X1Y1X2Y2>(bounds.to_owned())?;
  let extended_line_segment = extend_line_segment(line_segment, bounds, extend_start, extend_end);

  Ok(serde_wasm_bindgen::to_value(&extended_line_segment)?)
}
