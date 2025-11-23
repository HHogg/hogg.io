#![cfg_attr(target_arch = "wasm32", no_main)]

mod error;
mod post_message;
mod post_update;
mod simulation_loop;
mod simulation_program;
mod simulation_steps;
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
use crate::post_message::Message;
use crate::simulation_loop::SimulationLoop;
use crate::simulation_program::SimulationProgram;
use crate::thread_storage::{
  get_canvas, get_simulation_loop, get_simulation_program, set_canvas, set_simulation_loop,
  set_simulation_program,
};

#[wasm_bindgen(start)]
fn main() -> Result<(), JsError> {
  console_log::init_with_level(log::Level::Debug).expect("Failed to initialize logger");
  panic::set_hook(Box::new(console_error_panic_hook::hook));
  Message::Log("Epigenetics simulation".to_string()).send();
  Message::Log("----------------------".to_string()).send();
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
pub fn get_max_texture_depth() -> Result<u32, JsValue> {
  let simulation_program_rc = get_simulation_program().ok_or(SimulationError::ProgramNotFound)?;
  let max_depth = simulation_program_rc
    .borrow()
    .device
    .limits()
    .max_texture_dimension_3d;
  Ok(max_depth)
}

#[wasm_bindgen]
pub fn get_texture_depth() -> Result<u32, JsValue> {
  let simulation_program_rc = get_simulation_program().ok_or(SimulationError::ProgramNotFound)?;
  let depth = simulation_program_rc.borrow().depth;
  Ok(depth)
}

#[wasm_bindgen]
pub fn set_texture_depth(depth: u32) -> Result<(), JsValue> {
  let simulation_program_rc = get_simulation_program().ok_or(SimulationError::ProgramNotFound)?;
  let mut simulation_program = simulation_program_rc.borrow_mut();
  simulation_program
    .set_texture_depth(depth)
    .map_err(JsValue::from)?;
  Message::TextureDepthSet(depth).send();
  simulation_program.log_stats().map_err(JsValue::from)?;
  Ok(())
}

#[wasm_bindgen]
pub async fn init_simulation(width: u32, height: u32) -> Result<(), JsValue> {
  let canvas = get_canvas().ok_or(SimulationError::MissingCanvas)?;

  let simulation_program = SimulationProgram::create(canvas, width, height)
    .await
    .map_err(JsValue::from)?;
  let program_rc = Rc::new(RefCell::new(simulation_program));

  // Store the program in thread-local storage (using the same Rc<RefCell<>>)
  set_simulation_program(program_rc.clone());

  // Create the simulation loop (this will also render the first frame)
  let loop_instance = SimulationLoop::create(program_rc.clone()).map_err(JsValue::from)?;
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

  simulation_program_rc
    .borrow_mut()
    .resize(width, height)
    .map_err(JsValue::from)?;

  Ok(())
}
