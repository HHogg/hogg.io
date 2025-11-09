mod compute;
mod render;

use wasm_bindgen::JsValue;
use web_sys::WebGl2RenderingContext;

use crate::context::get_context;

pub fn create(gl: &WebGl2RenderingContext) -> Result<(), JsValue> {
  compute::create(gl)?;
  render::create(gl)?;

  Ok(())
}

pub fn run(elapsed: f64) -> Result<(), JsValue> {
  if let Some(context) = get_context() {
    // Compute frame on GPU (writes to compute texture)
    if let Err(e) = compute::run(&context, elapsed) {
      log::error!("Error computing frame on GPU: {:?}", e);
      return Err(JsValue::from_str("Error computing frame on GPU"));
    }

    // Render frame from compute texture to canvas
    if let Err(e) = render::run(&context, elapsed) {
      log::error!("Error rendering frame: {:?}", e);
      return Err(JsValue::from_str("Error rendering frame"));
    }
  }

  Ok(())
}
