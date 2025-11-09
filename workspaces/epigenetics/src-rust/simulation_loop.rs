use std::{cell::RefCell, rc::Rc};

use wasm_bindgen::{prelude::Closure, JsValue};

use crate::post_message::{post_message, Message};
use crate::post_update::schedule_post_update;
use crate::programs;
use crate::utils::{clear_timeout, request_animation_frame};

// Global state for the simulation loop
type LoopClosure = Rc<RefCell<Option<Closure<dyn FnMut()>>>>;

thread_local! {
  static ANIMATION_FRAME_ID: RefCell<Option<u32>> = const { RefCell::new(None) };
  static LOOP_CLOSURE: RefCell<Option<LoopClosure>> = const { RefCell::new(None) };
  static LOOP_STATE: RefCell<LoopState> = RefCell::new(LoopState::default());
}

#[derive(Clone)]
struct LoopState {
  frame_count: u32,
  is_running: bool,
  post_update_interval: u32,
  start_time: f64,
}

impl LoopState {
  pub fn get_elapsed_seconds(&self) -> f64 {
    (js_sys::Date::now() - self.start_time) / 1000.0_f64
  }

  pub fn increment_frame_count(&mut self) {
    self.frame_count += 1;
  }

  pub fn set_post_update_interval(&mut self, interval: u32) {
    self.post_update_interval = interval;
  }
}

impl Default for LoopState {
  fn default() -> Self {
    Self {
      frame_count: 0,
      is_running: false,
      post_update_interval: 30,
      start_time: js_sys::Date::now(),
    }
  }
}

pub fn get_animation_frame_id() -> Option<u32> {
  ANIMATION_FRAME_ID.with(|id| *id.borrow())
}

pub fn set_animation_frame_id(animation_frame_id: u32) {
  ANIMATION_FRAME_ID.with(|id| {
    *id.borrow_mut() = Some(animation_frame_id);
  });
}

fn get_loop_state() -> LoopState {
  LOOP_STATE.with(|s| s.borrow().clone())
}

fn set_loop_state(state: LoopState) {
  LOOP_STATE.with(|s| {
    *s.borrow_mut() = state;
  });
}

pub fn set_is_running(is_running: bool) {
  LOOP_STATE.with(|s| {
    s.borrow_mut().is_running = is_running;
  });
}

fn set_loop_closure(closure: LoopClosure) {
  LOOP_CLOSURE.with(|c| {
    *c.borrow_mut() = Some(closure);
  });
}

fn take_loop_closure() -> Option<LoopClosure> {
  LOOP_CLOSURE.with(|c| c.borrow_mut().take())
}

pub fn set_post_update_interval(interval: u32) {
  LOOP_STATE.with(|s| {
    s.borrow_mut().set_post_update_interval(interval);
  });
}

pub fn is_running() -> bool {
  LOOP_STATE.with(|s| s.borrow().is_running)
}

pub fn start() -> Result<(), JsValue> {
  // Create closure for the simulation loop
  let closure = Rc::new(RefCell::new(None::<Closure<dyn FnMut()>>));

  let closure_for_loop = closure.clone();
  let loop_closure = Closure::wrap(Box::new(move || {
    let mut loop_state = get_loop_state();

    if !loop_state.is_running {
      if stop().is_err() {
        post_message(Message::Error("Failed to stop simulation loop".to_string()));
      }

      return;
    }

    // Calculate elapsed time in seconds
    let elapsed = loop_state.get_elapsed_seconds();
    if programs::run(elapsed).is_err() {
      log::error!("simulation_loop: Error running programs");
      return;
    }

    loop_state.increment_frame_count();

    let is_update_frame = loop_state.frame_count % loop_state.post_update_interval == 0;
    if is_update_frame {
      match schedule_post_update(loop_state.post_update_interval) {
        Ok(_) => {}
        Err(e) => {
          log::error!("simulation_loop: Failed to schedule post update: {:?}", e);
          return;
        }
      }
    }

    // Schedule next frame using requestAnimationFrame wrapper
    if let Some(closure) = closure_for_loop.borrow().as_ref() {
      match request_animation_frame(closure) {
        Ok(animation_frame_id) => {
          set_animation_frame_id(animation_frame_id);
        }
        Err(e) => {
          log::error!("simulation_loop: Failed to schedule next frame: {:?}", e);
        }
      }
    }
  }) as Box<dyn FnMut()>);

  closure.borrow_mut().replace(loop_closure);
  set_loop_closure(closure.clone());
  set_is_running(true);

  // Schedule the first frame
  let closure_for_first_frame = closure.clone();
  if let Some(closure) = closure_for_first_frame.borrow().as_ref() {
    match request_animation_frame(closure) {
      Ok(animation_frame_id) => {
        set_animation_frame_id(animation_frame_id);
      }
      Err(e) => {
        log::error!("simulation_loop: Failed to schedule first frame");
        stop().ok();
        return Err(e);
      }
    }
  }

  Ok(())
}

pub fn stop() -> Result<(), JsValue> {
  if let Some(animation_frame_id) = get_animation_frame_id() {
    clear_timeout(animation_frame_id)?;
  }

  take_loop_closure();
  set_loop_state(LoopState::default());

  Ok(())
}
