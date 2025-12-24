use std::{cell::RefCell, rc::Rc};

use wasm_bindgen::prelude::Closure;

use crate::error::SimulationError;
use crate::post_message::Message;
use crate::post_update::schedule_post_update;
use crate::sim;
use crate::utils::{clear_timeout, request_animation_frame};

type LoopClosure = Rc<RefCell<Option<Closure<dyn FnMut()>>>>;

pub struct Loop {
  animation_frame_id: Option<u32>,
  loop_closure: Option<LoopClosure>,
  loop_state: LoopState,
  program: Option<Rc<RefCell<sim::Program>>>,
}

#[derive(Clone)]
struct LoopState {
  is_running: bool,
  // is_paused: bool,
  post_update_interval: u32,
  start_time: Option<f64>,
  paused_time: Option<f64>,
  paused_elapsed_time: f64,
}

impl LoopState {
  pub fn get_elapsed_seconds(&self) -> Option<f64> {
    if let Some(start_time) = self.start_time {
      Some((js_sys::Date::now() - start_time - self.paused_elapsed_time) / 1000.0_f64)
    } else {
      None
    }
  }

  pub fn set_post_update_interval(&mut self, interval: u32) {
    self.post_update_interval = interval;
  }
}

impl Default for LoopState {
  fn default() -> Self {
    Self {
      is_running: false,
      // is_paused: false,
      post_update_interval: 30,
      start_time: None,
      paused_time: None,
      paused_elapsed_time: 0.0,
    }
  }
}

impl Loop {
  pub fn create(program: Rc<RefCell<sim::Program>>) -> Result<Self, SimulationError> {
    let mut loop_instance = Self {
      animation_frame_id: None,
      loop_closure: None,
      loop_state: LoopState::default(),
      program: Some(program.clone()),
    };

    // Render the first frame
    loop_instance.render_frame(&program, Some(0.0))?;

    Ok(loop_instance)
  }

  pub fn set_animation_frame_id(&mut self, animation_frame_id: u32) {
    self.animation_frame_id = Some(animation_frame_id);
  }

  pub fn set_post_update_interval(&mut self, interval: u32) {
    self.loop_state.set_post_update_interval(interval);
  }

  pub fn pause(&mut self) -> Result<(), SimulationError> {
    if !self.loop_state.is_running {
      return Ok(());
    }

    // Store the elapsed time when pausing
    self.loop_state.paused_time = Some(js_sys::Date::now());
    self.loop_state.is_running = false;

    Message::SimulationPaused.send();

    Ok(())
  }

  pub fn resume(&mut self) -> Result<(), SimulationError> {
    if self.loop_state.is_running {
      return Ok(());
    }

    // Increase the paused elapsed time
    let paused_time = self
      .loop_state
      .paused_time
      .ok_or(SimulationError::LoopNotPaused)?;
    let pause_elapsed_time = js_sys::Date::now() - paused_time;

    self.loop_state.paused_elapsed_time += pause_elapsed_time;
    self.loop_state.paused_time = None;
    self.loop_state.is_running = true;

    // Resume the loop by scheduling the next frame now that we're running again
    self.schedule_next_frame()?;

    Message::SimulationResumed.send();

    Ok(())
  }

  pub fn stop(&mut self) -> Result<(), SimulationError> {
    if let Some(animation_frame_id) = self.animation_frame_id {
      clear_timeout(animation_frame_id)
        .map_err(|e| SimulationError::ClearTimeoutFailed(format!("{e:?}")))?;
    }

    // Reset the loop closure and animation frame id
    self.animation_frame_id = None;
    self.loop_closure = None;

    // Reset the loop state
    self.loop_state.is_running = false;
    self.loop_state.start_time = None;
    self.loop_state.paused_time = None;
    self.loop_state.paused_elapsed_time = 0.0;

    // Reset the program and render the first frame
    let program_opt = self.program.clone();
    if let Some(program) = program_opt {
      program.borrow_mut().reset()?;
      self.render_frame(&program, Some(0.0))?;
    }

    Message::SimulationLoopStopped.send();

    Ok(())
  }

  pub fn step_frame(&mut self) -> Result<(), SimulationError> {
    if self.loop_state.is_running {
      self.pause()?;
    }

    // Render the next frame using the simulation time
    // Clone the program reference to avoid borrow checker issues
    let program_opt = self.program.clone();
    if let Some(program) = program_opt {
      self.render_frame(&program, None)?;
    }

    Ok(())
  }

  pub fn start(&mut self, loop_rc: Rc<RefCell<Loop>>) -> Result<(), SimulationError> {
    // Verify we have a program
    if self.program.is_none() {
      return Err(SimulationError::ProgramNotFound);
    }

    if self.loop_state.is_running {
      return Ok(());
    }

    // Create closure for the simulation loop
    let closure = Rc::new(RefCell::new(None::<Closure<dyn FnMut()>>));
    let loop_rc_for_closure = loop_rc.clone();
    let loop_closure = Closure::wrap(Self::create_loop_closure(loop_rc_for_closure));

    closure.borrow_mut().replace(loop_closure);

    // Reset start time when starting the loop so elapsed time starts from now
    self.loop_state.start_time = Some(js_sys::Date::now());
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

    Message::SimulationLoopStarted.send();

    Ok(())
  }

  fn create_loop_closure(loop_rc: Rc<RefCell<Loop>>) -> Box<dyn FnMut()> {
    Box::new(move || {
      let mut loop_ref = loop_rc.borrow_mut();

      if !loop_ref.loop_state.is_running {
        return;
      }

      // Get the program from the loop before running the frame
      // We need to clone the program reference to avoid borrow checker issues
      let program_opt = loop_ref.program.clone();
      if let Some(program) = program_opt {
        match loop_ref.render_frame(&program, None) {
          Ok(stats) => {
            let is_update_frame = stats.pass_index % loop_ref.loop_state.post_update_interval == 0;

            if is_update_frame {
              match schedule_post_update(loop_ref.loop_state.post_update_interval, stats) {
                Ok(()) => {
                  log::info!("simulation_loop: Scheduled post update");
                }
                Err(e) => {
                  log::error!("simulation_loop: Error scheduling post update: {:?}", e);
                  Message::Error(format!("Failed to schedule post update: {e:?}")).send();
                  return;
                }
              }
            }
          }
          Err(e) => {
            log::error!("simulation_loop: Error rendering frame: {:?}", e);
            Message::Error(format!("Failed to render frame: {e:?}")).send();
            return;
          }
        }

        // Schedule next frame
        if let Err(e) = loop_ref.schedule_next_frame() {
          log::error!("simulation_loop: Error scheduling next frame: {:?}", e);
          Message::Error(format!("Failed to schedule next frame: {e:?}")).send();
        }
      }
    }) as Box<dyn FnMut()>
  }

  fn render_frame(
    &mut self,
    program: &Rc<RefCell<sim::Program>>,
    elapsed_time_override: Option<f64>,
  ) -> Result<sim::program::RunStats, SimulationError> {
    // Calculate elapsed time in seconds
    let elapsed = if let Some(elapsed_time_override) = elapsed_time_override {
      elapsed_time_override
    } else {
      self
        .loop_state
        .get_elapsed_seconds()
        .ok_or(SimulationError::LoopNotRunning)?
    };

    let stats = program
      .borrow_mut()
      .run(elapsed)
      .map_err(|e| SimulationError::StepExecution(format!("{e:?}")))?;

    Ok(stats)
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
