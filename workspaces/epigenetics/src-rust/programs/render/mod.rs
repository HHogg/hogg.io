mod shaders;

use std::cell::RefCell;

use wasm_bindgen::JsValue;
use web_sys::{WebGl2RenderingContext, WebGlBuffer, WebGlProgram, WebGlUniformLocation};

use self::shaders::{create_fragment_shader, create_vertex_shader};
use crate::context::ContextState;
use crate::fbos::get_read_texture;
use crate::utils::{create_quad_vertices, link_program};

#[derive(Clone)]
pub struct ProgramState {
  pub program: WebGlProgram,
  pub vertex_buffer: WebGlBuffer,
  pub u_time: WebGlUniformLocation,
  pub u_resolution: WebGlUniformLocation,
  pub u_compute_texture: WebGlUniformLocation,
  pub a_position: i32,
}

thread_local! {
  static STATE: RefCell<Option<ProgramState>> = const { RefCell::new(None) };
}

fn get_state() -> Result<ProgramState, JsValue> {
  STATE
    .with(|s| s.borrow().clone())
    .ok_or_else(|| JsValue::from_str("Render program not initialized"))
}

fn update_state(state: ProgramState) {
  STATE.with(|s| {
    *s.borrow_mut() = Some(state);
  });
}

pub fn create(gl: &WebGl2RenderingContext) -> Result<(), JsValue> {
  let vert_shader = create_vertex_shader(gl)?;
  let render_frag_shader = create_fragment_shader(gl)?;
  let render_program = link_program(gl, &vert_shader, &render_frag_shader)?;
  let vertex_buffer = create_quad_vertices(gl)?;
  let u_time = gl
    .get_uniform_location(&render_program, "u_time")
    .ok_or_else(|| JsValue::from_str("render::u_time not found"))?;
  let u_resolution = gl
    .get_uniform_location(&render_program, "u_resolution")
    .ok_or_else(|| JsValue::from_str("render::u_resolution not found"))?;
  let u_compute_texture = gl
    .get_uniform_location(&render_program, "u_compute_texture")
    .ok_or_else(|| JsValue::from_str("render::u_compute_texture not found"))?;
  let a_position = gl.get_attrib_location(&render_program, "a_position");

  update_state(ProgramState {
    program: render_program,
    vertex_buffer,
    u_time,
    u_resolution,
    u_compute_texture,
    a_position,
  });

  Ok(())
}

pub fn run(context: &ContextState, elapsed_time: f64) -> Result<(), JsValue> {
  let ContextState {
    gl, width, height, ..
  } = context;
  let ProgramState {
    program,
    vertex_buffer,
    u_time,
    u_resolution,
    u_compute_texture,
    a_position,
  } = get_state()?;

  let read_texture = get_read_texture()?;

  // Use render shader program
  gl.use_program(Some(&program));

  // Clear and set viewport
  gl.viewport(0, 0, *width as i32, *height as i32);
  gl.clear_color(0.0, 0.0, 0.0, 1.0);
  gl.clear(WebGl2RenderingContext::COLOR_BUFFER_BIT);

  // Bind compute texture
  gl.active_texture(WebGl2RenderingContext::TEXTURE0);
  gl.bind_texture(WebGl2RenderingContext::TEXTURE_2D, Some(&read_texture));

  // Bind to default framebuffer (canvas)
  gl.bind_framebuffer(WebGl2RenderingContext::FRAMEBUFFER, None);

  // Bind vertex buffer
  gl.bind_buffer(
    WebGl2RenderingContext::ARRAY_BUFFER,
    Some(vertex_buffer.as_ref()),
  );

  // Set uniforms
  gl.uniform1f(Some(&u_time), elapsed_time as f32);
  gl.uniform2f(Some(&u_resolution), *width as f32, *height as f32);
  gl.uniform1i(Some(&u_compute_texture), 0);

  // Set up vertex attribute
  gl.enable_vertex_attrib_array(a_position as u32);
  gl.vertex_attrib_pointer_with_i32(
    a_position as u32,
    2,
    WebGl2RenderingContext::FLOAT,
    false,
    0,
    0,
  );

  // Draw full-screen quad
  gl.draw_arrays(WebGl2RenderingContext::TRIANGLES, 0, 6);

  match gl.get_error() {
    WebGl2RenderingContext::NO_ERROR => Ok(()),
    error => Err(JsValue::from_str(&format!(
      "WebGL error in render::run: {error}"
    ))),
  }
}
