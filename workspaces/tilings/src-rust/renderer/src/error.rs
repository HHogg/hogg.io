use colorgrad::GradientBuilderError;
use serde::Serialize;
use wasm_bindgen::JsValue;

#[derive(Clone, Debug, thiserror::Error, Serialize)]
pub enum Error {
  #[error("Application error: {reason}")]
  ApplicationError { reason: String },
  #[error("Invalid tiling: {reason}")]
  InvalidTiling { reason: &'static str },
}

impl From<JsValue> for Error {
  fn from(js_value: JsValue) -> Self {
    Self::ApplicationError {
      reason: js_value.as_string().unwrap_or_default(),
    }
  }
}

impl From<GradientBuilderError> for Error {
  fn from(error: GradientBuilderError) -> Self {
    Self::ApplicationError {
      reason: error.to_string(),
    }
  }
}
