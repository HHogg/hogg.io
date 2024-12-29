use std::cell::RefCell;
use std::rc::Rc;
use tiling::build::Metrics;
use tiling::validation::Flag;
use tiling::Tiling;
use tiling_renderer::draw;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::console;
use web_sys::js_sys;
use web_sys::OffscreenCanvas;
use web_sys::WorkerGlobalScope;

use crate::events::post_event;
use crate::events::DrawStateSnapshot;
use crate::events::PlayerStateSnapshot;
use crate::events::RenderStateSnapshot;
use crate::events::WasmWorkerEvent;

fn post_render_event(tiling: &Tiling) {
  post_event(WasmWorkerEvent::Render(RenderStateSnapshot {
    result: tiling.result.clone(),
  }));
}

fn post_draw_event(metrics: Metrics) {
  post_event(WasmWorkerEvent::Draw(DrawStateSnapshot { metrics }));
}

fn post_play_state(tiling: &Option<&Tiling>, state: &RenderLoopState) {
  post_event(WasmWorkerEvent::Player(PlayerStateSnapshot {
    draw_index: state.draw_index,
    max_index: tiling
      .as_ref()
      .map_or(0, |t| t.plane.stages.len().saturating_sub(1) as u16),
    interval_ms: state.get_interval_ms(),
    is_looping: state.is_looping,
    is_playing: state.is_playing,
  }));
}

fn get_max_stage_from_tiling(tiling: &Option<&Tiling>) -> u16 {
  tiling
    .as_ref()
    .map_or(0, |t| t.plane.stages.len().saturating_sub(1) as u16)
}

#[derive(Default)]
pub struct RenderLoopInner {
  handle: RefCell<Option<i32>>,
  tiling: Rc<RefCell<Option<Tiling>>>,
  state: Rc<RefCell<RenderLoopState>>,
  needs_draw: Rc<RefCell<bool>>,
  needs_render: Rc<RefCell<bool>>,
}

pub struct RenderLoopState {
  draw_index: u16,
  is_looping: bool,
  is_playing: bool,

  canvas: Option<OffscreenCanvas>,
  expansion_phases: u8,
  notation: String,
  render_options: tiling_renderer::Options,
  speed: f32,
  width: u32,
  height: u32,
}

impl RenderLoopState {
  fn get_interval_ms(&self) -> i32 {
    ((1.0 / self.speed.clamp(0.25, 2.0)) * 500.0) as i32
  }
}

impl Default for RenderLoopState {
  fn default() -> Self {
    Self {
      draw_index: 0,
      is_looping: true,
      is_playing: false,

      canvas: None,
      expansion_phases: 0,
      notation: String::new(),
      render_options: tiling_renderer::Options::default(),
      speed: 1.0,
      width: 0,
      height: 0,
    }
  }
}

impl RenderLoopInner {
  pub fn new() -> Self {
    Self {
      handle: RefCell::new(None),
      tiling: Rc::new(RefCell::new(None)),
      state: Rc::new(RefCell::new(RenderLoopState::default())),
      needs_draw: Rc::new(RefCell::new(true)),
      needs_render: Rc::new(RefCell::new(true)),
    }
  }

  pub fn start(&self) -> Result<(), JsValue> {
    let state_ptr = self.state.clone();
    let needs_draw_ptr = self.needs_draw.clone();
    let needs_render_ptr = self.needs_render.clone();
    let tiling_ptr = self.tiling.clone();

    // Create a closure that will be called on each interval.
    let closure = Closure::wrap(Box::new(move || {
      let mut state = state_ptr.borrow_mut();
      let mut needs_draw = needs_draw_ptr.borrow_mut();
      let mut needs_render = needs_render_ptr.borrow_mut();
      let mut tiling = tiling_ptr.borrow_mut();

      if *needs_render {
        *needs_render = false;
        *tiling = Some(
          Tiling::default()
            .with_validations(Some(Flag::all()))
            .with_expansion_phases(state.expansion_phases)
            .from_string(state.notation.as_str()),
        );

        state.draw_index = get_max_stage_from_tiling(&tiling.as_ref());

        if let Some(tiling) = tiling.as_ref() {
          post_render_event(tiling);
        }
      }

      if *needs_draw {
        *needs_draw = false;
        state.render_options.max_stage = Some(state.draw_index);

        if let (Some(tiling), Some(canvas)) = (tiling.as_ref(), state.canvas.as_ref()) {
          draw(tiling, canvas, &state.render_options)
            .inspect(|metrics| post_draw_event(metrics.clone()))
            .map_err(|e| console::error_1(&serde_wasm_bindgen::to_value(&e).unwrap()))
            .ok();
        }
      }

      if state.is_playing {
        let draw_index = state.draw_index;
        let max_index = tiling
          .as_ref()
          .map_or(0, |t| t.plane.stages.len().saturating_sub(1) as u16);

        if draw_index < max_index {
          state.draw_index = draw_index + 1;
          *needs_draw = true;
        } else if state.is_looping {
          state.draw_index = 0;
          *needs_draw = true;
        } else {
          state.is_playing = false;
        }
      }

      if *needs_render || *needs_draw {
        post_play_state(&tiling.as_ref(), &state);
      }
    }) as Box<dyn FnMut()>);

    let global = js_sys::global()
      .dyn_into::<WorkerGlobalScope>()
      .map_err(|_| JsValue::from_str("Unable to cast global to WorkerGlobalScope"))?;

    let handle_id = global.set_interval_with_callback_and_timeout_and_arguments_0(
      closure.as_ref().unchecked_ref(),
      self.state.borrow().get_interval_ms(),
    )?;

    // Keep the closure alive.
    closure.forget();

    *self.handle.borrow_mut() = Some(handle_id);

    Ok(())
  }

  pub fn stop(&self) -> Result<(), JsValue> {
    if let Some(id) = *self.handle.borrow() {
      let global = js_sys::global()
        .dyn_into::<WorkerGlobalScope>()
        .map_err(|_| JsValue::from_str("Unable to cast global to WorkerGlobalScope"))?;

      global.clear_interval_with_handle(id);
    }

    *self.handle.borrow_mut() = None;

    Ok(())
  }

  pub fn restart(&self) -> Result<(), JsValue> {
    self.stop()?;
    self.start()
  }

  pub fn set_draw(&self) {
    *self.needs_draw.borrow_mut() = true;
  }

  fn set_draw_index(&self, index: u16) {
    let mut state = self.state.borrow_mut();
    state.draw_index = index;
    state.is_playing = false;
    self.set_draw();
  }

  fn set_render(&self) {
    *self.needs_render.borrow_mut() = true;
    self.set_draw();
  }

  pub fn set_canvas(&self, canvas: OffscreenCanvas) {
    self.state.borrow_mut().canvas = Some(canvas);
  }

  pub fn set_dimensions(&self, width: u32, height: u32) -> Result<(), JsValue> {
    if self.state.borrow().width == width && self.state.borrow().height == height {
      return Ok(());
    }

    self.state.borrow_mut().width = width;
    self.state.borrow_mut().height = height;
    self.set_draw();

    Ok(())
  }

  pub fn set_expansion_phases(&self, expansion_phases: u8) -> Result<(), JsValue> {
    if self.state.borrow().expansion_phases == expansion_phases {
      return Ok(());
    }

    self.state.borrow_mut().expansion_phases = expansion_phases;
    self.set_render();

    Ok(())
  }

  pub fn set_notation(&self, notation: &str) -> Result<(), JsValue> {
    if self.state.borrow().notation == notation {
      return Ok(());
    }

    self.state.borrow_mut().notation = notation.to_string();
    self.set_render();

    Ok(())
  }

  pub fn set_render_options(&self, render_options: tiling_renderer::Options) {
    self.state.borrow_mut().render_options = render_options;
    self.set_draw();
  }

  pub fn set_speed(&self, speed: f32) -> Result<(), JsValue> {
    if self.state.borrow().speed == speed {
      return Ok(());
    }

    self.state.borrow_mut().speed = speed;

    self.restart()
  }

  pub fn play(&self) -> Result<(), JsValue> {
    let mut state = self.state.borrow_mut();
    let tiling = self.tiling.borrow();

    state.is_playing = true;

    post_play_state(&tiling.as_ref(), &state);

    Ok(())
  }

  pub fn pause(&self) -> Result<(), JsValue> {
    let mut state = self.state.borrow_mut();
    let tiling = self.tiling.borrow();

    state.is_playing = false;

    post_play_state(&tiling.as_ref(), &state);

    Ok(())
  }

  pub fn step_forward(&self) -> Result<(), JsValue> {
    let tiling = self.tiling.borrow();
    let max_stage = get_max_stage_from_tiling(&tiling.as_ref());
    let draw_index = self.state.borrow().draw_index + 1;

    self.set_draw_index(draw_index.clamp(0, max_stage));
    Ok(())
  }

  pub fn step_backward(&self) -> Result<(), JsValue> {
    let draw_index = self.state.borrow().draw_index;

    self.set_draw_index(draw_index.saturating_sub(1));
    Ok(())
  }

  pub fn to_start(&self) -> Result<(), JsValue> {
    self.set_draw_index(0);
    Ok(())
  }

  pub fn to_end(&self) -> Result<(), JsValue> {
    let tiling = self.tiling.borrow();

    if let Some(tiling) = tiling.as_ref() {
      self.set_draw_index(tiling.plane.stages.len().saturating_sub(1) as u16);
    }

    Ok(())
  }
}
