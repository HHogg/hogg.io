use wasm_bindgen::prelude::*;

use crate::{sequence, Sequence};

#[wasm_bindgen]
pub fn is_bidirectional(sequence: &JsValue) -> Result<bool, JsError> {
  Ok(sequence::is_bidirectional(
    &serde_wasm_bindgen::from_value::<Sequence>(sequence.to_owned())?,
  ))
}

#[wasm_bindgen]
pub fn length(sequence: &JsValue) -> Result<usize, JsError> {
  Ok(sequence::length(
    &serde_wasm_bindgen::from_value::<Sequence>(sequence.to_owned())?,
  ))
}

#[wasm_bindgen]
pub fn min(sequence: &JsValue) -> Result<JsValue, JsError> {
  Ok(serde_wasm_bindgen::to_value(&sequence::min(
    serde_wasm_bindgen::from_value::<Sequence>(sequence.to_owned())?,
  ))?)
}

#[wasm_bindgen]
pub fn to_string(sequences: &JsValue) -> Result<String, JsError> {
  Ok(sequence::to_string(serde_wasm_bindgen::from_value::<
    Vec<Sequence>,
  >(sequences.to_owned())?))
}

#[wasm_bindgen]
pub fn sort(sequences: &JsValue) -> Result<JsValue, JsError> {
  Ok(serde_wasm_bindgen::to_value(&sequence::sort(
    serde_wasm_bindgen::from_value::<Vec<Sequence>>(sequences.to_owned())?,
  ))?)
}
