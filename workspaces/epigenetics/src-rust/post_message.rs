use serde::Serialize;
use typeshare::typeshare;
use wasm_bindgen::{JsCast, JsValue};
use web_sys::DedicatedWorkerGlobalScope;

#[derive(Debug, Serialize, Clone)]
#[serde(tag = "name", content = "data")]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub enum Message {
  WasmReady,
  CanvasTransferred,
  SimulationInit,
  SimulationLoopStarted,
  SimulationLoopStopped,
  SimulationPaused,
  SimulationResumed,
  SimulationReset,
  PostUpdateIntervalSet(u32),
  Error(String),
  Log(String),
}

impl Message {
  pub fn send(&self) {
    post_message(self.clone());
  }
}

fn post_message(message: Message) {
  if let Err(e) = post_message_inner(message) {
    log::error!("post_message: Failed to post message: {:?}", e);
  }
}

fn post_message_inner(message: Message) -> Result<(), JsValue> {
  let global = js_sys::global()
    .dyn_into::<DedicatedWorkerGlobalScope>()
    .map_err(|_| JsValue::from_str("Not in a worker context"))?;

  let js_value = serde_wasm_bindgen::to_value(&message)
    .map_err(|err| JsValue::from_str(&format!("Serde error: {err}")))?;

  global.post_message(&js_value)?;
  Ok(())
}
