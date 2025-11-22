use std::{cell::RefCell, rc::Rc};

use wasm_bindgen::prelude::Closure;

use crate::error::SimulationError;
use crate::post_message::Message;
use crate::post_update::schedule_post_update;
use crate::simulation_program::SimulationProgram;
use crate::utils::{clear_timeout, request_animation_frame};

type LoopClosure = Rc<RefCell<Option<Closure<dyn FnMut()>>>>;

pub struct SimulationLoop {
  animation_frame_id: Option<u32>,
  loop_closure: Option<LoopClosure>,
  loop_state: LoopState,
  program: Option<Rc<RefCell<SimulationProgram>>>,
}

#[derive(Clone)]
struct LoopState {
  frame_count: u32,
  is_running: bool,
  is_paused: bool,
  post_update_interval: u32,
  start_time: f64,
  simulation_time: f64, // Tracks simulation time for step-by-step advancement
  paused_elapsed_time: f64, // Stores elapsed time when paused, to resume from the same point
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
      is_paused: false,
      post_update_interval: 30,
      start_time: js_sys::Date::now(),
      simulation_time: 0.0,
      paused_elapsed_time: 0.0,
    }
  }
}

impl SimulationLoop {
  pub fn create(program: Rc<RefCell<SimulationProgram>>) -> Result<Self, SimulationError> {
    let mut loop_instance = Self {
      animation_frame_id: None,
      loop_closure: None,
      loop_state: LoopState::default(),
      program: Some(program.clone()),
    };

    // Render the first frame
    loop_instance.render_frame(&program)?;

    Ok(loop_instance)
  }

  fn render_frame(
    &mut self,
    program: &Rc<RefCell<SimulationProgram>>,
  ) -> Result<(), SimulationError> {
    // Calculate elapsed time in seconds
    let elapsed = self.loop_state.get_elapsed_seconds();
    program
      .borrow_mut()
      .run(elapsed)
      .map_err(|e| SimulationError::StepExecution(format!("{e:?}")))?;

    Ok(())
  }

  fn render_frame_with_time(
    &mut self,
    program: &Rc<RefCell<SimulationProgram>>,
    time: f64,
  ) -> Result<(), SimulationError> {
    // Use the provided time instead of elapsed time
    program
      .borrow_mut()
      .run(time)
      .map_err(|e| SimulationError::StepExecution(format!("{e:?}")))?;

    Ok(())
  }

  pub fn set_animation_frame_id(&mut self, animation_frame_id: u32) {
    self.animation_frame_id = Some(animation_frame_id);
  }

  pub fn set_post_update_interval(&mut self, interval: u32) {
    self.loop_state.set_post_update_interval(interval);
  }

  pub fn is_running(&self) -> bool {
    self.loop_state.is_running
  }

  pub fn is_paused(&self) -> bool {
    self.loop_state.is_paused
  }

  pub fn pause(&mut self) -> Result<(), SimulationError> {
    if !self.is_running() {
      return Err(SimulationError::LoopNotRunning);
    }

    // Store the elapsed time when pausing
    self.loop_state.paused_elapsed_time = self.loop_state.get_elapsed_seconds();
    self.loop_state.is_paused = true;
    Ok(())
  }

  pub fn resume(&mut self) -> Result<(), SimulationError> {
    if !self.is_running() {
      return Err(SimulationError::LoopNotRunning);
    }

    // Adjust start_time so that elapsed time continues from where we paused
    // This prevents time from jumping forward when resuming after a long pause
    let current_elapsed = self.loop_state.paused_elapsed_time;
    self.loop_state.start_time = js_sys::Date::now() - (current_elapsed * 1000.0);
    self.loop_state.is_paused = false;
    Ok(())
  }

  pub fn reset(&mut self) -> Result<(), SimulationError> {
    self.loop_state.frame_count = 0;
    self.loop_state.start_time = js_sys::Date::now();
    self.loop_state.simulation_time = 0.0;

    // Render a frame after reset to show the reset state
    // Clone the program reference to avoid borrow checker issues
    let program_opt = self.program.clone();
    if let Some(program) = program_opt {
      self.render_frame(&program)?;
    }

    Ok(())
  }

  pub fn step_frame(&mut self) -> Result<(), SimulationError> {
    // If running, pause first
    if self.loop_state.is_running && !self.loop_state.is_paused {
      self.loop_state.is_paused = true;
    }

    // Advance simulation time by one frame (assuming 60fps = 1/60 seconds per frame)
    const FRAME_DELTA: f64 = 1.0 / 60.0;
    self.loop_state.simulation_time += FRAME_DELTA;

    // Render the next frame using the simulation time
    // Clone the program reference to avoid borrow checker issues
    let program_opt = self.program.clone();
    if let Some(program) = program_opt {
      self.render_frame_with_time(&program, self.loop_state.simulation_time)?;
    }

    Ok(())
  }

  pub fn stop(&mut self) -> Result<(), SimulationError> {
    if let Some(animation_frame_id) = self.animation_frame_id {
      clear_timeout(animation_frame_id)
        .map_err(|e| SimulationError::ClearTimeoutFailed(format!("{e:?}")))?;
    }

    self.loop_closure = None;
    self.loop_state.is_running = false;
    self.loop_state.is_paused = true; // Leave in paused state
    self.animation_frame_id = None;

    // Reset the timer
    self.loop_state.frame_count = 0;
    self.loop_state.start_time = js_sys::Date::now();
    self.loop_state.simulation_time = 0.0;

    // Render the first frame after stopping to show the reset state
    // Clone the program reference to avoid borrow checker issues
    let program_opt = self.program.clone();
    if let Some(program) = program_opt {
      self.render_frame(&program)?;
    }

    // Note: We keep the program reference so we can restart without re-initializing

    Ok(())
  }

  pub fn start(&mut self, loop_rc: Rc<RefCell<SimulationLoop>>) -> Result<(), SimulationError> {
    // Verify we have a program
    if self.program.is_none() {
      return Err(SimulationError::ProgramNotFound);
    }

    // Reset start time when starting the loop so elapsed time starts from now
    self.loop_state.start_time = js_sys::Date::now();
    // Reset simulation time to match elapsed time when starting
    self.loop_state.simulation_time = 0.0;
    // Clear paused state when starting
    self.loop_state.is_paused = false;

    // Create closure for the simulation loop
    let closure = Rc::new(RefCell::new(None::<Closure<dyn FnMut()>>));

    let loop_rc_for_closure = loop_rc.clone();

    // The closure can now directly access self via the Rc<RefCell<>>
    let loop_closure = Closure::wrap(Box::new(move || {
      let mut loop_ref = loop_rc_for_closure.borrow_mut();

      if !loop_ref.is_running() {
        loop_ref.stop().ok();
        return;
      }

      // Get the program from the loop before running the frame
      // We need to clone the program reference to avoid borrow checker issues
      let program_opt = loop_ref.program.clone();
      if let Some(program) = program_opt {
        // Run simulation frame
        if let Err(e) = loop_ref.run_simulation_frame(&program) {
          log::error!("simulation_loop: Error running frame: {:?}", e);
          Message::Error(format!("Simulation frame error: {e:?}")).send();
          return;
        }

        // Schedule next frame
        if let Err(e) = loop_ref.schedule_next_frame() {
          log::error!("simulation_loop: Error scheduling next frame: {:?}", e);
          Message::Error(format!("Failed to schedule next frame: {e:?}")).send();
        }
      }
    }) as Box<dyn FnMut()>);

    closure.borrow_mut().replace(loop_closure);
    self.loop_closure = Some(closure.clone());
    self.loop_state.is_running = true;

    // Schedule the first frame
    let closure_for_first_frame = closure.clone();
    if let Some(closure) = closure_for_first_frame.borrow().as_ref() {
      match request_animation_frame(closure) {
        Ok(animation_frame_id) => {
          self.set_animation_frame_id(animation_frame_id);
        }
        Err(e) => {
          log::error!("simulation_loop: Failed to schedule first frame: {:?}", e);
          self.stop().ok();
          return Err(SimulationError::AnimationFrameFailed(format!("{e:?}")));
        }
      }
    }

    Ok(())
  }

  fn run_simulation_frame(
    &mut self,
    simulation_program: &Rc<RefCell<SimulationProgram>>,
  ) -> Result<(), SimulationError> {
    // Skip simulation update if paused
    if !self.loop_state.is_paused {
      // Calculate elapsed time in seconds
      let elapsed = self.loop_state.get_elapsed_seconds();
      // Update simulation time to match elapsed time when running normally
      self.loop_state.simulation_time = elapsed;
      simulation_program
        .borrow_mut()
        .run(elapsed)
        .map_err(|e| SimulationError::StepExecution(format!("{e:?}")))?;
    }

    self.loop_state.increment_frame_count();

    let is_update_frame = self.loop_state.frame_count % self.loop_state.post_update_interval == 0;
    if is_update_frame {
      schedule_post_update(self.loop_state.post_update_interval).map_err(|e| {
        SimulationError::LoopStopFailed(format!("Failed to schedule post update: {e:?}"))
      })?;
    }

    Ok(())
  }

  fn schedule_next_frame(&mut self) -> Result<(), SimulationError> {
    // Clone the closure reference to avoid borrowing issues
    let closure_rc = self.loop_closure.clone();
    if let Some(closure_rc) = closure_rc {
      if let Some(closure) = closure_rc.borrow().as_ref() {
        match request_animation_frame(closure) {
          Ok(animation_frame_id) => {
            self.set_animation_frame_id(animation_frame_id);
          }
          Err(e) => {
            Message::Error(format!("Failed to schedule next frame: {e:?}")).send();
            return Err(SimulationError::AnimationFrameFailed(format!("{e:?}")));
          }
        }
      }
    }
    Ok(())
  }
}
