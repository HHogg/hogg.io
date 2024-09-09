use std::panic;

use circular_sequence::{
  get_length as get_length_internal, get_min_permutation as get_min_permutation_internal,
  get_symmetry_index as get_symmetry_index_internal, is_symmetrical as is_symmetrical_internal,
  sort as sort_internal, to_string as to_string_internal, Sequence,
};
use line_segment_extending::{extend_line_segment, X1Y1X2Y2};
use serde_wasm_bindgen::from_value;
use tiling::notation::{Path, Transform};
use tiling::{validation, Tiling};
use tiling_renderer::{draw, Options};
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::{JsCast, JsError, JsValue};
use web_sys::OffscreenCanvas;

#[wasm_bindgen(start)]
fn main() -> Result<(), JsError> {
  console_log::init_with_level(log::Level::Debug).unwrap();
  panic::set_hook(Box::new(console_error_panic_hook::hook));

  Ok(())
}

// circular-sequence

#[wasm_bindgen]
pub fn get_symmetry_index(sequence: &JsValue) -> Result<Option<usize>, JsError> {
  Ok(get_symmetry_index_internal(&from_value::<Sequence>(
    sequence.to_owned(),
  )?))
}

#[wasm_bindgen]
pub fn is_symmetrical(sequence: &JsValue) -> Result<bool, JsError> {
  Ok(is_symmetrical_internal(&from_value::<Sequence>(
    sequence.to_owned(),
  )?))
}

#[wasm_bindgen]
pub fn get_length(sequence: &JsValue) -> Result<usize, JsError> {
  Ok(get_length_internal(&from_value::<Sequence>(
    sequence.to_owned(),
  )?))
}

#[wasm_bindgen]
pub fn get_min_permutation(sequence: &JsValue) -> Result<JsValue, JsError> {
  Ok(serde_wasm_bindgen::to_value(
    &get_min_permutation_internal(&from_value::<Sequence>(sequence.to_owned())?),
  )?)
}

#[wasm_bindgen]
pub fn to_string(sequences: &JsValue) -> Result<String, JsError> {
  Ok(to_string_internal(from_value::<Vec<Sequence>>(
    sequences.to_owned(),
  )?))
}

#[wasm_bindgen]
pub fn sort(sequences: &JsValue) -> Result<JsValue, JsError> {
  Ok(serde_wasm_bindgen::to_value(&sort_internal(from_value::<
    Vec<Sequence>,
  >(
    sequences.to_owned(),
  )?))?)
}

// line-segment-extending

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

// tilings

#[wasm_bindgen]
pub fn parse_notation(notation: &str) -> Result<JsValue, JsError> {
  Ok(serde_wasm_bindgen::to_value(
    &Tiling::default().from_string(notation.into()),
  )?)
}

#[wasm_bindgen]
pub fn parse_transform(transform: &str, path: &str) -> Result<JsValue, JsError> {
  Ok(serde_wasm_bindgen::to_value(&Transform::from_string(
    transform,
    &Path::default().from_string(path)?,
  )?)?)
}

#[wasm_bindgen]
pub fn find_previous_tiling(
  notation: &str,
  validations: &JsValue,
) -> Result<Option<String>, JsError> {
  let validations =
    serde_wasm_bindgen::from_value::<Vec<validation::Flag>>(validations.to_owned())?;

  let mut tiling = Tiling::default()
    .with_validations(Some(validations))
    .with_expansion_phases(3)
    .with_link_paths(true)
    .from_string(notation.to_string());

  Ok(
    tiling
      .find_previous_tiling()
      .map(|t| t.notation.to_string()),
  )
}

#[wasm_bindgen]
pub fn find_next_tiling(notation: &str, validations: &JsValue) -> Result<Option<String>, JsError> {
  let validations =
    serde_wasm_bindgen::from_value::<Vec<validation::Flag>>(validations.to_owned())?;

  let mut tiling = Tiling::default()
    .with_validations(Some(validations))
    .with_expansion_phases(3)
    .with_link_paths(true)
    .from_string(notation.to_string());

  Ok(tiling.find_next_tiling().map(|t| t.notation.to_string()))
}

#[wasm_bindgen]
pub fn render_notation(
  canvas: JsValue,
  notation: &str,
  options: &JsValue,
  validations: &JsValue,
) -> Result<JsValue, JsError> {
  let offscreen_canvas: OffscreenCanvas = canvas.dyn_into().unwrap();
  let options = serde_wasm_bindgen::from_value::<Options>(options.to_owned())?;
  let validations =
    serde_wasm_bindgen::from_value::<Vec<validation::Flag>>(validations.to_owned())?;

  let tiling = Tiling::default()
    .with_validations(Some(validations))
    .with_scale(options.scale_size.unwrap_or(1))
    .with_type_ahead(true)
    .with_expansion_phases(options.expansion_phases.unwrap_or_default())
    .from_string(notation.to_string());

  draw(&tiling, offscreen_canvas, options)?;

  Ok(serde_wasm_bindgen::to_value(&tiling)?)
}
