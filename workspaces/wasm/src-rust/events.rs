use serde::Serialize;
use hogg_tiling::build::{self, Metrics};
use typeshare::typeshare;
use wasm_bindgen::{JsCast, JsValue};
use web_sys::{console, js_sys, DedicatedWorkerGlobalScope};

#[derive(Debug, Serialize)]
#[serde(tag = "name", content = "data")]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub enum WasmWorkerEvent {
  Draw(DrawStateSnapshot),
  Error(WasmError),
  FindPreviousTiling(String),
  FindNextTiling(String),
  Player(PlayerStateSnapshot),
  Render(RenderStateSnapshot),
}

#[derive(Debug, Default, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct DrawStateSnapshot {
  pub metrics: Metrics,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct WasmError {
  pub message: String,
}

#[derive(Debug, Default, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct PlayerStateSnapshot {
  pub draw_index: u16,
  pub max_index: u16,
  pub interval_ms: i32,
  pub is_looping: bool,
  pub is_playing: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct RenderStateSnapshot {
  pub result: build::Result,
}

pub fn post_event(event: WasmWorkerEvent) {
  let global = js_sys::global()
    .dyn_into::<DedicatedWorkerGlobalScope>()
    .map_err(|_| console::error_1(&JsValue::from_str("Not in a worker context")));

  let js_value = serde_wasm_bindgen::to_value(&event)
    .map_err(|err| console::error_1(&JsValue::from_str(&format!("Serde error: {}", err))));

  if let (Ok(global), Ok(js_value)) = (global, js_value) {
    let _ = global
      .post_message(&js_value)
      .map_err(|err| console::error_1(&err));
  }
}
