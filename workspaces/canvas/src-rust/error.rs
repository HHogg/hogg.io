use wasm_bindgen::JsValue;

#[derive(Clone, Debug, thiserror::Error)]
pub enum Error {
  #[error("Canvas error: {reason}")]
  CanvasError { reason: String },
}

impl From<JsValue> for Error {
  fn from(js_value: JsValue) -> Self {
    Self::CanvasError {
      reason: js_value.as_string().unwrap_or_default(),
    }
  }
}
