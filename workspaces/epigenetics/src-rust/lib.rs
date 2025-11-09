mod context;
mod fbos;
mod post_message;
mod post_update;
mod programs;
mod simulation_loop;
mod utils;

use std::panic;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsError;
use wasm_bindgen::JsValue;
use web_sys::OffscreenCanvas;

use crate::context::create_context;
use crate::context::get_context;
use crate::post_message::{post_message, Message};

#[wasm_bindgen(start)]
fn main() -> Result<(), JsError> {
  console_log::init_with_level(log::Level::Debug).expect("Failed to initialize logger");
  panic::set_hook(Box::new(console_error_panic_hook::hook));
  post_message(Message::Log("Epigenetics simulation".to_string()));
  post_message(Message::WasmReady);
  Ok(())
}

#[wasm_bindgen]
pub fn transfer_canvas(canvas: OffscreenCanvas) -> Result<(), JsValue> {
  create_context(canvas)?;
  post_message(Message::CanvasTransferred);
  Ok(())
}

#[wasm_bindgen]
pub fn refresh_dimensions(width: u32, height: u32) -> Result<(), JsValue> {
  context::update_dimensions(width, height);
  post_message(Message::DimensionsSet);
  Ok(())
}

#[wasm_bindgen]
pub fn set_post_update_interval(frames: u32) -> Result<(), JsValue> {
  simulation_loop::set_post_update_interval(frames);
  post_message(Message::PostUpdateIntervalSet(frames));
  Ok(())
}

#[wasm_bindgen]
pub fn init_simulation() -> Result<(), JsValue> {
  stop_simulation_loop()?;

  if let Some(context) = get_context() {
    programs::create(&context.gl)?;
    fbos::create(&context)?;
  }

  post_message(Message::SimulationInit);
  Ok(())
}

#[wasm_bindgen]
pub fn start_simulation_loop() -> Result<(), JsValue> {
  if simulation_loop::is_running() {
    return Ok(());
  }

  simulation_loop::start()?;
  post_message(Message::SimulationLoopStarted);
  Ok(())
}

#[wasm_bindgen]
pub fn stop_simulation_loop() -> Result<(), JsValue> {
  if !simulation_loop::is_running() {
    return Ok(());
  }

  simulation_loop::stop()?;
  post_message(Message::SimulationLoopStopped);
  Ok(())
}
