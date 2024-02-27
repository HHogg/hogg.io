use wasm_bindgen::prelude::*;

use crate::{
  get_length as get_length_internal,
  get_min_permutation as get_min_permutation_internal,
  get_symmetry_index as get_symmetry_index_internal,
  is_symmetrical as is_symmetrical_internal,
  sort as sort_internal,
  to_string as to_string_internal,
  Sequence,
};

#[wasm_bindgen]
pub fn get_symmetry_index(sequence: &JsValue) -> Result<Option<usize>, JsError> {
  Ok(get_symmetry_index_internal(
    &serde_wasm_bindgen::from_value::<Sequence>(sequence.to_owned())?,
  ))
}

#[wasm_bindgen]
pub fn is_symmetrical(sequence: &JsValue) -> Result<bool, JsError> {
  Ok(is_symmetrical_internal(&serde_wasm_bindgen::from_value::<
    Sequence,
  >(sequence.to_owned())?))
}

#[wasm_bindgen]
pub fn get_length(sequence: &JsValue) -> Result<usize, JsError> {
  Ok(get_length_internal(&serde_wasm_bindgen::from_value::<
    Sequence,
  >(sequence.to_owned())?))
}

#[wasm_bindgen]
pub fn get_min_permutation(sequence: &JsValue) -> Result<JsValue, JsError> {
  Ok(serde_wasm_bindgen::to_value(
    &get_min_permutation_internal(&serde_wasm_bindgen::from_value::<Sequence>(
      sequence.to_owned(),
    )?),
  )?)
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
