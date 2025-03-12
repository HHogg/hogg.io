use std::rc::Rc;

use hogg_spatial_grid_map::Fxx;
use hogg_tiling_generator::FeatureToggle;
use inner::RenderLoopInner;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::{JsCast, JsValue};
use web_sys::OffscreenCanvas;

mod inner;

#[wasm_bindgen]
#[derive(Default)]
pub struct RenderLoop {
  inner: Rc<RenderLoopInner>,
}

#[wasm_bindgen]
impl RenderLoop {
  #[wasm_bindgen(constructor)]
  pub fn new() -> Self {
    Self {
      inner: Rc::new(RenderLoopInner::new()),
    }
  }

  pub fn start(&self) -> Result<(), JsValue> {
    self.inner.start()
  }

  pub fn stop(&self) -> Result<(), JsValue> {
    self.inner.stop()
  }

  pub fn set_canvas(&self, canvas: JsValue) {
    let offscreen_canvas = canvas
      .dyn_into::<OffscreenCanvas>()
      .expect("Failed to convert canvas to offscreen canvas");

    self.inner.set_canvas(offscreen_canvas)
  }

  pub fn set_dimensions(&self, width: u32, height: u32) -> Result<(), JsValue> {
    self.inner.set_dimensions(width, height)
  }

  pub fn set_repetitions(&self, repetitions: u8) -> Result<(), JsValue> {
    self.inner.set_repetitions(repetitions)
  }

  pub fn set_feature_toggles(&self, feature_toggles: &JsValue) -> Result<(), JsValue> {
    let feature_toggles = serde_wasm_bindgen::from_value::<
      std::collections::HashMap<FeatureToggle, bool>,
    >(feature_toggles.to_owned())?;

    self.inner.set_feature_toggles(feature_toggles)
  }

  pub fn set_notation(&self, notation: &str) -> Result<(), JsValue> {
    self.inner.set_notation(notation)
  }

  pub fn set_render_options(&self, options: &JsValue) -> Result<(), JsValue> {
    let render_options =
      serde_wasm_bindgen::from_value::<hogg_tiling_renderer::Options>(options.to_owned())?;

    self.inner.set_render_options(render_options);

    Ok(())
  }

  pub fn set_speed(&self, speed: Fxx) -> Result<(), JsValue> {
    self.inner.set_speed(speed)
  }

  pub fn play(&self) -> Result<(), JsValue> {
    self.inner.play()
  }

  pub fn pause(&self) -> Result<(), JsValue> {
    self.inner.pause()
  }

  pub fn step_forward(&self) -> Result<(), JsValue> {
    self.inner.step_forward()
  }

  pub fn step_backward(&self) -> Result<(), JsValue> {
    self.inner.step_backward()
  }

  pub fn to_start(&self) -> Result<(), JsValue> {
    self.inner.to_start()
  }

  pub fn to_end(&self) -> Result<(), JsValue> {
    self.inner.to_end()
  }
}
