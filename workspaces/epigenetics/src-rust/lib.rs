#![cfg_attr(target_arch = "wasm32", no_main)]

mod error;
mod post_message;
mod post_update;
mod sim;
mod thread_storage;
mod utils;

use std::cell::RefCell;
use std::panic;
use std::rc::Rc;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsError;
use wasm_bindgen::JsValue;
use web_sys::OffscreenCanvas;

use crate::error::SimulationError;
use crate::post_message::{send_estimated_memory_usage, Message};
use crate::thread_storage::{
  get_canvas, get_data_config as get_data_config_thread_local, get_simulation_dimensions,
  get_simulation_loop, get_simulation_program, set_canvas,
  set_data_config as set_data_config_thread_local,
  set_simulation_dimensions as set_simulation_dimensions_thread_local, set_simulation_loop,
  set_simulation_program,
};

#[wasm_bindgen(start)]
fn main() -> Result<(), JsError> {
  console_log::init_with_level(log::Level::Debug).expect("Failed to initialize logger");
  panic::set_hook(Box::new(console_error_panic_hook::hook));

  // Initialize WESL
  wesl::Wesl::new("src-rust/sim/steps").build_artifact(
    &"hogg_epigenetics::main".parse().unwrap(),
    "epigenetics_shaders",
  );

  Message::Log("Epigenetics simulation".to_string()).send();
  Message::Log("----------------------".to_string()).send();

  // Set default config and send it to frontend
  let default_config = sim::data::Config::create();
  set_data_config_thread_local(default_config.clone());
  Message::DataConfigSet(default_config).send();
  Message::WasmReady.send();
  Ok(())
}

#[wasm_bindgen]
pub async fn transfer_canvas(canvas: OffscreenCanvas) -> Result<(), JsValue> {
  set_canvas(canvas);
  Message::CanvasTransferred.send();
  Ok(())
}

#[wasm_bindgen]
pub fn set_post_update_interval(frames: u32) -> Result<(), JsValue> {
  let loop_rc = get_simulation_loop().ok_or(SimulationError::LoopNotCreated)?;
  loop_rc.borrow_mut().set_post_update_interval(frames);
  Message::PostUpdateIntervalSet(frames).send();
  Ok(())
}

#[wasm_bindgen]
pub fn set_data_config(data_config: JsValue) -> Result<(), JsValue> {
  let data_config: sim::data::Config =
    serde_wasm_bindgen::from_value(data_config).map_err(JsValue::from)?;
  set_data_config_thread_local(data_config.clone());
  Message::DataConfigSet(data_config.clone()).send();
  send_estimated_memory_usage();
  Ok(())
}

#[wasm_bindgen]
pub fn get_data_memory_usage_estimated(width: u32, height: u32) -> Result<u64, JsValue> {
  let data_config = get_data_config_thread_local().ok_or(SimulationError::MissingDataConfig)?;
  let memory_usage = sim::Data::memory_usage_estimated(&data_config, width, height);
  Ok(memory_usage)
}

#[wasm_bindgen]
pub fn set_simulation_dimensions(width: u32, height: u32) -> Result<(), JsValue> {
  set_simulation_dimensions_thread_local(width, height);
  send_estimated_memory_usage();
  Ok(())
}

#[wasm_bindgen]
pub async fn init_simulation() -> Result<(), JsValue> {
  let canvas = get_canvas().ok_or(SimulationError::MissingCanvas)?;
  let data_config = get_data_config_thread_local().ok_or(SimulationError::MissingDataConfig)?;
  let (width, height) = get_simulation_dimensions().ok_or(SimulationError::MissingDimensions)?;

  let simulation_program = sim::Program::create(canvas, width, height, data_config)
    .await
    .map_err(JsValue::from)?;
  let program_rc = Rc::new(RefCell::new(simulation_program));

  // Store the program in thread-local storage (using the same Rc<RefCell<>>)
  set_simulation_program(program_rc.clone());

  // Create the simulation loop (this will also render the first frame)
  let loop_instance = sim::Loop::create(program_rc.clone()).map_err(JsValue::from)?;
  let loop_rc = Rc::new(RefCell::new(loop_instance));

  // Store the loop in thread-local storage
  set_simulation_loop(loop_rc);

  Message::SimulationInit.send();
  program_rc.borrow().log_stats().map_err(JsValue::from)?;
  Ok(())
}

#[wasm_bindgen]
pub fn start_simulation_loop() -> Result<(), JsValue> {
  let loop_rc = get_simulation_loop().ok_or(SimulationError::LoopNotCreated)?;

  if loop_rc.borrow().is_running() {
    return Ok(());
  }

  loop_rc
    .borrow_mut()
    .start(loop_rc.clone())
    .map_err(JsValue::from)?;
  Message::SimulationLoopStarted.send();
  Ok(())
}

#[wasm_bindgen]
pub fn stop_simulation_loop() -> Result<(), JsValue> {
  let loop_rc = get_simulation_loop();
  if let Some(loop_ref) = loop_rc {
    if !loop_ref.borrow().is_running() {
      return Ok(());
    }
    loop_ref.borrow_mut().stop().map_err(JsValue::from)?;
    Message::SimulationLoopStopped.send();
  }
  Ok(())
}

#[wasm_bindgen]
pub fn pause_simulation() -> Result<(), JsValue> {
  let loop_rc = get_simulation_loop().ok_or(SimulationError::LoopNotCreated)?;
  loop_rc.borrow_mut().pause().map_err(JsValue::from)?;
  Message::SimulationPaused.send();
  Ok(())
}

#[wasm_bindgen]
pub fn resume_simulation() -> Result<(), JsValue> {
  let loop_rc = get_simulation_loop().ok_or(SimulationError::LoopNotCreated)?;
  loop_rc.borrow_mut().resume().map_err(JsValue::from)?;
  Message::SimulationResumed.send();
  Ok(())
}

#[wasm_bindgen]
pub fn is_simulation_paused() -> bool {
  if let Some(loop_rc) = get_simulation_loop() {
    loop_rc.borrow().is_paused()
  } else {
    false
  }
}

#[wasm_bindgen]
pub fn reset_simulation() -> Result<(), JsValue> {
  let loop_rc = get_simulation_loop().ok_or(SimulationError::LoopNotCreated)?;
  // Reset doesn't stop the loop, so if it was running, it will keep running
  loop_rc.borrow_mut().reset().map_err(JsValue::from)?;
  Message::SimulationReset.send();
  Ok(())
}

#[wasm_bindgen]
pub fn step_simulation_frame() -> Result<(), JsValue> {
  let loop_rc = get_simulation_loop().ok_or(SimulationError::LoopNotCreated)?;
  let was_running = loop_rc.borrow().is_running() && !loop_rc.borrow().is_paused();

  loop_rc.borrow_mut().step_frame().map_err(JsValue::from)?;

  // If it was running, send paused message
  if was_running {
    Message::SimulationPaused.send();
  }

  Ok(())
}

#[wasm_bindgen]
pub fn resize_simulation(width: u32, height: u32) -> Result<(), JsValue> {
  let simulation_program_rc = get_simulation_program().ok_or(SimulationError::ProgramNotFound)?;

  // Update stored dimensions
  set_simulation_dimensions_thread_local(width, height);

  simulation_program_rc
    .borrow_mut()
    .resize(width, height)
    .map_err(JsValue::from)?;

  // Recalculate and send memory usage estimate
  send_estimated_memory_usage();

  Ok(())
}
