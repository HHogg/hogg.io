mod shaders;

use std::cell::RefCell;

use wasm_bindgen::JsValue;
use web_sys::{WebGl2RenderingContext, WebGlBuffer, WebGlProgram, WebGlUniformLocation};

use crate::context::ContextState;
use crate::fbos::{get_read_texture, get_write_framebuffer, swap_buffers};
use crate::utils::{create_quad_vertices, link_program};

use self::shaders::{create_fragment_shader, create_vertex_shader};

#[derive(Clone)]
pub struct ProgramState {
  pub program: WebGlProgram,
  pub vertex_buffer: WebGlBuffer,
  pub u_time: WebGlUniformLocation,
  pub u_resolution: WebGlUniformLocation,
  pub u_previous_texture: WebGlUniformLocation,
  pub a_position: i32,
}

thread_local! {
  static STATE: RefCell<Option<ProgramState>> = const { RefCell::new(None) };
}

fn get_state() -> Result<ProgramState, JsValue> {
  STATE
    .with(|s| s.borrow().clone())
    .ok_or_else(|| JsValue::from_str("Compute program not initialized"))
}

fn update_state(state: ProgramState) {
  STATE.with(|s| {
    *s.borrow_mut() = Some(state);
  });
}

pub fn create(gl: &WebGl2RenderingContext) -> Result<(), JsValue> {
  let vert_shader = create_vertex_shader(gl)?;
  let compute_frag_shader = create_fragment_shader(gl)?;
  let compute_program = link_program(gl, &vert_shader, &compute_frag_shader)?;
  let vertex_buffer = create_quad_vertices(gl)?;
  let uniform_time = gl
    .get_uniform_location(&compute_program, "u_time")
    .ok_or_else(|| JsValue::from_str("compute::u_time not found"))?;
  let uniform_resolution = gl
    .get_uniform_location(&compute_program, "u_resolution")
    .ok_or_else(|| JsValue::from_str("compute::u_resolution not found"))?;
  let uniform_previous_texture = gl
    .get_uniform_location(&compute_program, "u_previous_texture")
    .ok_or_else(|| JsValue::from_str("compute::u_previous_texture not found"))?;
  let a_loc_position = gl.get_attrib_location(&compute_program, "a_position");

  update_state(ProgramState {
    program: compute_program,
    vertex_buffer,
    u_time: uniform_time,
    u_resolution: uniform_resolution,
    u_previous_texture: uniform_previous_texture,
    a_position: a_loc_position,
  });

  Ok(())
}

pub fn run(context: &ContextState, elapsed_time: f64) -> Result<(), JsValue> {
  let ContextState {
    gl, width, height, ..
  } = context;
  let compute_state = get_state()?;
  let read_texture = get_read_texture()?;
  let write_framebuffer = get_write_framebuffer()?;

  // Use compute shader program
  gl.use_program(Some(&compute_state.program));

  // Bind write framebuffer for writing FIRST
  gl.bind_framebuffer(
    WebGl2RenderingContext::FRAMEBUFFER,
    Some(&write_framebuffer),
  );

  // Clear and set viewport (now clearing the correct framebuffer)
  gl.viewport(0, 0, *width as i32, *height as i32);
  gl.clear_color(0.0, 0.0, 0.0, 1.0);
  gl.clear(WebGl2RenderingContext::COLOR_BUFFER_BIT);

  // Bind read texture (previous frame) for reading
  gl.active_texture(WebGl2RenderingContext::TEXTURE0);
  gl.bind_texture(WebGl2RenderingContext::TEXTURE_2D, Some(&read_texture));

  // Bind vertex buffer
  gl.bind_buffer(
    WebGl2RenderingContext::ARRAY_BUFFER,
    Some(compute_state.vertex_buffer.as_ref()),
  );

  // Set uniforms
  gl.uniform1f(Some(&compute_state.u_time), elapsed_time as f32);
  gl.uniform2f(
    Some(&compute_state.u_resolution),
    *width as f32,
    *height as f32,
  );
  gl.uniform1i(Some(&compute_state.u_previous_texture), 0);

  // Set up vertex attribute
  gl.enable_vertex_attrib_array(compute_state.a_position as u32);
  gl.vertex_attrib_pointer_with_i32(
    compute_state.a_position as u32,
    2,
    WebGl2RenderingContext::FLOAT,
    false,
    0,
    0,
  );

  // Draw full-screen quad to write buffer
  gl.draw_arrays(WebGl2RenderingContext::TRIANGLES, 0, 6);

  // Unbind framebuffer after drawing to ensure the write is complete
  gl.bind_framebuffer(WebGl2RenderingContext::FRAMEBUFFER, None);

  // Swap buffers for next frame (what we just wrote to becomes the new read buffer)
  swap_buffers();

  match gl.get_error() {
    WebGl2RenderingContext::NO_ERROR => Ok(()),
    error => Err(JsValue::from_str(&format!(
      "WebGL error in compute::run: {error}"
    ))),
  }
}
