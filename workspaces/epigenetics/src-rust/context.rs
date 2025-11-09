use std::cell::RefCell;

use wasm_bindgen::{JsCast, JsValue};
use web_sys::{OffscreenCanvas, WebGl2RenderingContext};

thread_local! {
  static CONTEXT_STATE: RefCell<ContextStateMaybe> = RefCell::new(ContextStateMaybe::default());
}

#[derive(Clone, Default)]
struct ContextStateMaybe {
  pub gl: Option<WebGl2RenderingContext>,
  pub width: Option<u32>,
  pub height: Option<u32>,
}

#[derive(Clone)]
pub struct ContextState {
  pub gl: WebGl2RenderingContext,
  pub width: u32,
  pub height: u32,
}

pub fn create_context(canvas: OffscreenCanvas) -> Result<(), JsValue> {
  let gl = canvas
    .get_context("webgl2")
    .map_err(|e| JsValue::from_str(&format!("Failed to get webgl2 context: {e:?}")))?
    .and_then(|obj| obj.dyn_into::<WebGl2RenderingContext>().ok())
    .ok_or_else(|| JsValue::from_str("Failed to get WebGL2 rendering context"))?;

  CONTEXT_STATE.with(|c| {
    let mut context = c.borrow_mut();
    context.gl = Some(gl);

    if let (Some(width), Some(height)) = (context.width, context.height) {
      context
        .gl
        .as_ref()
        .unwrap()
        .viewport(0, 0, width as i32, height as i32);
    }
  });

  Ok(())
}

pub fn get_context() -> Option<ContextState> {
  CONTEXT_STATE.with(|c| {
    let context = c.borrow();

    if context.gl.is_some() && context.width.is_some() && context.height.is_some() {
      Some(ContextState {
        gl: context.gl.as_ref().unwrap().clone(),
        width: context.width.unwrap(),
        height: context.height.unwrap(),
      })
    } else {
      None
    }
  })
}
pub fn update_dimensions(width: u32, height: u32) {
  CONTEXT_STATE.with(|c| {
    let mut context = c.borrow_mut();

    context.width = Some(width);
    context.height = Some(height);

    if let Some(gl) = context.gl.as_ref() {
      gl.viewport(0, 0, width as i32, height as i32);
    }
  });
}
