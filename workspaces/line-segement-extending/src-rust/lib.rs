use geometry::{BBox, LineSegment};
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::{JsError, JsValue};

#[wasm_bindgen(start)]
fn main() -> Result<(), JsError> {
  std::panic::set_hook(Box::new(console_error_panic_hook::hook));
  console_log::init_with_level(log::Level::Debug).unwrap();

  Ok(())
}

#[wasm_bindgen]
pub fn get_extended_line_segment(
  bbox: JsValue,
  line_segment: JsValue,
  extend_start: bool,
  extend_end: bool,
) -> Result<JsValue, JsError> {
  let bbox = serde_wasm_bindgen::from_value::<BBox>(bbox.to_owned())?;
  let line_segment = serde_wasm_bindgen::from_value::<LineSegment>(line_segment.to_owned())?;
  let extended_line_segment = line_segment.extend_to_bbox(&bbox, extend_start, extend_end);

  Ok(serde_wasm_bindgen::to_value(&extended_line_segment)?)
}
