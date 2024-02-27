use wasm_bindgen::JsValue;

#[derive(Clone, Debug, thiserror::Error)]
pub enum Error {
  #[error("Application error: {reason}")]
  ApplicationError { reason: String },
}

impl From<JsValue> for Error {
  fn from(js_value: JsValue) -> Self {
    Self::ApplicationError {
      reason: js_value.as_string().unwrap_or_default(),
    }
  }
}
