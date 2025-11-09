use std::cell::RefCell;

use wasm_bindgen::JsValue;
use web_sys::WebGl2RenderingContext;

use crate::context::ContextState;

thread_local! {
  // Double buffering: two textures and frame buffers
  static COMPUTE_TEXTURE_A: RefCell<Option<web_sys::WebGlTexture>> = const { RefCell::new(None) };
  static COMPUTE_TEXTURE_B: RefCell<Option<web_sys::WebGlTexture>> = const { RefCell::new(None) };
  static COMPUTE_FRAMEBUFFER_A: RefCell<Option<web_sys::WebGlFramebuffer>> = const { RefCell::new(None) };
  static COMPUTE_FRAMEBUFFER_B: RefCell<Option<web_sys::WebGlFramebuffer>> = const { RefCell::new(None) };

  // Track which buffer is currently the read buffer (front buffer)
  static CURRENT_READ_BUFFER: RefCell<BufferSide> = const { RefCell::new(BufferSide::A) };
}

// Enum to track which buffer is currently the front (read) buffer
#[derive(Clone, Copy, PartialEq, Eq)]
enum BufferSide {
  A,
  B,
}

impl BufferSide {
  fn swap(self) -> Self {
    match self {
      BufferSide::A => BufferSide::B,
      BufferSide::B => BufferSide::A,
    }
  }
}

pub fn create(context: &ContextState) -> Result<(), JsValue> {
  let ContextState {
    gl, width, height, ..
  } = context;
  let compute_texture_a = create_texture(gl, width, height)?;
  let compute_framebuffer_a = create_framebuffer(gl, &compute_texture_a)?;
  let compute_texture_b = create_texture(gl, width, height)?;
  let compute_framebuffer_b = create_framebuffer(gl, &compute_texture_b)?;

  COMPUTE_TEXTURE_A.with(|t| *t.borrow_mut() = Some(compute_texture_a));
  COMPUTE_TEXTURE_B.with(|t| *t.borrow_mut() = Some(compute_texture_b));
  COMPUTE_FRAMEBUFFER_A.with(|f| *f.borrow_mut() = Some(compute_framebuffer_a));
  COMPUTE_FRAMEBUFFER_B.with(|f| *f.borrow_mut() = Some(compute_framebuffer_b));

  Ok(())
}

fn create_framebuffer(
  gl: &WebGl2RenderingContext,
  texture: &web_sys::WebGlTexture,
) -> Result<web_sys::WebGlFramebuffer, JsValue> {
  let framebuffer = gl
    .create_framebuffer()
    .ok_or_else(|| JsValue::from_str("Failed to create framebuffer"))?;

  gl.bind_framebuffer(WebGl2RenderingContext::FRAMEBUFFER, Some(&framebuffer));

  gl.framebuffer_texture_2d(
    WebGl2RenderingContext::FRAMEBUFFER,
    WebGl2RenderingContext::COLOR_ATTACHMENT0,
    WebGl2RenderingContext::TEXTURE_2D,
    Some(texture),
    0,
  );

  match gl.check_framebuffer_status(WebGl2RenderingContext::FRAMEBUFFER) {
    WebGl2RenderingContext::FRAMEBUFFER_COMPLETE => Ok(framebuffer),
    status => Err(JsValue::from_str(&format!(
      "Framebuffer not complete: status {status}"
    ))),
  }
}

fn create_texture(
  gl: &WebGl2RenderingContext,
  width: &u32,
  height: &u32,
) -> Result<web_sys::WebGlTexture, JsValue> {
  let texture = gl
    .create_texture()
    .ok_or_else(|| JsValue::from_str("Failed to create texture"))?;

  gl.bind_texture(WebGl2RenderingContext::TEXTURE_2D, Some(&texture));

  gl.tex_image_2d_with_i32_and_i32_and_i32_and_format_and_type_and_opt_array_buffer_view(
    WebGl2RenderingContext::TEXTURE_2D,
    0,
    WebGl2RenderingContext::RGBA as i32,
    *width as i32,
    *height as i32,
    0,
    WebGl2RenderingContext::RGBA,
    WebGl2RenderingContext::UNSIGNED_BYTE,
    None,
  )?;
  gl.tex_parameteri(
    WebGl2RenderingContext::TEXTURE_2D,
    WebGl2RenderingContext::TEXTURE_MIN_FILTER,
    WebGl2RenderingContext::NEAREST as i32,
  );
  gl.tex_parameteri(
    WebGl2RenderingContext::TEXTURE_2D,
    WebGl2RenderingContext::TEXTURE_MAG_FILTER,
    WebGl2RenderingContext::NEAREST as i32,
  );
  gl.tex_parameteri(
    WebGl2RenderingContext::TEXTURE_2D,
    WebGl2RenderingContext::TEXTURE_WRAP_S,
    WebGl2RenderingContext::CLAMP_TO_EDGE as i32,
  );
  gl.tex_parameteri(
    WebGl2RenderingContext::TEXTURE_2D,
    WebGl2RenderingContext::TEXTURE_WRAP_T,
    WebGl2RenderingContext::CLAMP_TO_EDGE as i32,
  );

  Ok(texture)
}

pub fn get_write_framebuffer() -> Result<web_sys::WebGlFramebuffer, JsValue> {
  let current_read_buffer = CURRENT_READ_BUFFER.with(|b| *b.borrow());
  let write_framebuffer = match current_read_buffer {
    BufferSide::A => COMPUTE_FRAMEBUFFER_B.with(|f| f.borrow().clone()),
    BufferSide::B => COMPUTE_FRAMEBUFFER_A.with(|f| f.borrow().clone()),
  }
  .ok_or_else(|| JsValue::from_str("Write framebuffer not initialized"))?;

  Ok(write_framebuffer)
}

pub fn get_read_texture() -> Result<web_sys::WebGlTexture, JsValue> {
  let current_read_buffer = CURRENT_READ_BUFFER.with(|b| *b.borrow());
  let read_texture = match current_read_buffer {
    BufferSide::A => COMPUTE_TEXTURE_A.with(|t| t.borrow().clone()),
    BufferSide::B => COMPUTE_TEXTURE_B.with(|t| t.borrow().clone()),
  }
  .ok_or_else(|| JsValue::from_str("Read texture not initialized"))?;

  Ok(read_texture)
}

pub fn swap_buffers() {
  CURRENT_READ_BUFFER.with(|b| {
    let current = *b.borrow();
    *b.borrow_mut() = current.swap();
  });
}
