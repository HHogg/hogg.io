use wasm_bindgen::prelude::*;

use crate::{
  draw,
  get_length as length_internal,
  get_min_permutation as min_internal,
  is_symmetrical as is_symmetrical_internal,
  sort as sort_internal,
  to_string as to_string_internal,
  Sequence,
};

#[wasm_bindgen]
pub fn is_symmetrical(sequence: &JsValue) -> Result<bool, JsError> {
  Ok(is_symmetrical_internal(&serde_wasm_bindgen::from_value::<
    Sequence,
  >(sequence.to_owned())?))
}

#[wasm_bindgen]
pub fn length(sequence: &JsValue) -> Result<usize, JsError> {
  Ok(length_internal(
    &serde_wasm_bindgen::from_value::<Sequence>(sequence.to_owned())?,
  ))
}

#[wasm_bindgen]
pub fn min(sequence: &JsValue) -> Result<JsValue, JsError> {
  Ok(serde_wasm_bindgen::to_value(&min_internal(
    &serde_wasm_bindgen::from_value::<Sequence>(sequence.to_owned())?,
  ))?)
}

#[wasm_bindgen]
pub fn to_string(sequences: &JsValue) -> Result<String, JsError> {
  Ok(to_string_internal(serde_wasm_bindgen::from_value::<
    Vec<Sequence>,
  >(sequences.to_owned())?))
}

#[wasm_bindgen]
pub fn sort(sequences: &JsValue) -> Result<JsValue, JsError> {
  Ok(serde_wasm_bindgen::to_value(&sort_internal(
    serde_wasm_bindgen::from_value::<Vec<Sequence>>(sequences.to_owned())?,
  ))?)
}

#[wasm_bindgen]
pub fn render(canvas_id: &str, sequence: &JsValue, options: &JsValue) -> Result<(), JsError> {
  let options = serde_wasm_bindgen::from_value::<draw::Options>(options.to_owned())?;
  let sequence = serde_wasm_bindgen::from_value::<Sequence>(sequence.to_owned())?;

  draw(canvas_id, sequence, options)?;

  Ok(())
}
