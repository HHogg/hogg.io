mod shaders;
mod webgl_utils;

use js_sys::Uint8Array;
use shaders::{COMPUTE_FRAGMENT_SHADER, RENDER_FRAGMENT_SHADER, VERTEX_SHADER};
use std::cell::RefCell;
use std::panic;
use std::rc::Rc;
use wasm_bindgen::closure::Closure;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsCast;
use wasm_bindgen::JsError;
use wasm_bindgen::JsValue;
use web_sys::DedicatedWorkerGlobalScope;
use web_sys::{OffscreenCanvas, WebGl2RenderingContext};
use webgl_utils::{compile_shader, create_quad_vertices, link_program};

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

// Storage for buffer and dimensions (for auto-start)
thread_local! {
  static SHARED_BUFFER: RefCell<Option<JsValue>> = RefCell::new(None);
  static SIMULATION_WIDTH: RefCell<u32> = RefCell::new(0);
  static SIMULATION_HEIGHT: RefCell<u32> = RefCell::new(0);
  static UPDATE_INTERVAL: RefCell<u32> = RefCell::new(30); // Default: update every 30 frames
}

// WebGL state for GPU compute and render
thread_local! {
  static CANVAS: RefCell<Option<OffscreenCanvas>> = RefCell::new(None);
  static GL_CONTEXT: RefCell<Option<WebGl2RenderingContext>> = RefCell::new(None);
  static COMPUTE_PROGRAM: RefCell<Option<web_sys::WebGlProgram>> = RefCell::new(None);
  static RENDER_PROGRAM: RefCell<Option<web_sys::WebGlProgram>> = RefCell::new(None);
  static TIME_UNIFORM: RefCell<Option<web_sys::WebGlUniformLocation>> = RefCell::new(None);
  static RESOLUTION_UNIFORM: RefCell<Option<web_sys::WebGlUniformLocation>> = RefCell::new(None);
  static PREVIOUS_TEXTURE_UNIFORM: RefCell<Option<web_sys::WebGlUniformLocation>> = RefCell::new(None);
  static VERTEX_BUFFER: RefCell<Option<web_sys::WebGlBuffer>> = RefCell::new(None);

  // Double buffering: two textures and framebuffers
  static COMPUTE_TEXTURE_A: RefCell<Option<web_sys::WebGlTexture>> = RefCell::new(None);
  static COMPUTE_TEXTURE_B: RefCell<Option<web_sys::WebGlTexture>> = RefCell::new(None);
  static COMPUTE_FRAMEBUFFER_A: RefCell<Option<web_sys::WebGlFramebuffer>> = RefCell::new(None);
  static COMPUTE_FRAMEBUFFER_B: RefCell<Option<web_sys::WebGlFramebuffer>> = RefCell::new(None);

  // Track which buffer is currently the read buffer (front buffer)
  static CURRENT_READ_BUFFER: RefCell<BufferSide> = RefCell::new(BufferSide::A);
}

// Global state for the simulation loop
thread_local! {
  static SIMULATION_STATE: RefCell<Option<SimulationState>> = RefCell::new(None);
}

struct SimulationState {
  buffer: JsValue, // SharedArrayBuffer stored as JsValue
  width: u32,
  height: u32,
  start_time: f64,
  is_running: bool,
  frame_count: u32,
  is_reading: bool, // Flag to prevent overlapping reads
  closure: Rc<RefCell<Option<Closure<dyn FnMut()>>>>,
  animation_frame_id: Option<u32>, // requestAnimationFrame returns u32
}

#[wasm_bindgen(start)]
fn main() -> Result<(), JsError> {
  console_log::init_with_level(log::Level::Debug).expect("Failed to initialize logger");
  panic::set_hook(Box::new(console_error_panic_hook::hook));

  Ok(())
}

#[wasm_bindgen]
pub fn init_shared_buffer(buffer: JsValue) {
  // Store the SharedArrayBuffer as JsValue for periodic updates
  log::info!("Simulation worker: Shared buffer initialized");
  SHARED_BUFFER.with(|b| {
    *b.borrow_mut() = Some(buffer);
  });

  // Try to auto-start simulation loop if canvas and dimensions are already set
  try_start_simulation_loop();
}

#[wasm_bindgen]
pub fn init_canvas(canvas: OffscreenCanvas) -> Result<(), JsValue> {
  CANVAS.with(|c| {
    *c.borrow_mut() = Some(canvas);
  });

  try_start_simulation_loop();
  Ok(())
}

#[wasm_bindgen]
pub fn set_dimensions(width: u32, height: u32) {
  SIMULATION_WIDTH.with(|w| {
    *w.borrow_mut() = width;
  });
  SIMULATION_HEIGHT.with(|h| {
    *h.borrow_mut() = height;
  });

  try_start_simulation_loop();
}

#[wasm_bindgen]
pub fn set_update_interval(frames: u32) {
  UPDATE_INTERVAL.with(|i| {
    *i.borrow_mut() = frames;
  });
}

#[wasm_bindgen]
pub fn write_shader_data(buffer: &mut [u8], offset: usize, data: &[u8]) -> Result<(), JsValue> {
  if offset + data.len() > buffer.len() {
    return Err(JsValue::from_str(
      "Buffer overflow: data exceeds buffer size",
    ));
  }

  buffer[offset..offset + data.len()].copy_from_slice(data);
  log::debug!(
    "Simulation worker: Wrote {} bytes at offset {}",
    data.len(),
    offset
  );

  Ok(())
}

#[wasm_bindgen]
pub fn read_shader_data(buffer: &[u8], offset: usize, length: usize) -> Result<Vec<u8>, JsValue> {
  if offset + length > buffer.len() {
    return Err(JsValue::from_str(
      "Buffer overflow: read exceeds buffer size",
    ));
  }

  let data = buffer[offset..offset + length].to_vec();
  log::debug!(
    "Simulation worker: Read {} bytes from offset {}",
    length,
    offset
  );

  Ok(data)
}

// Initialize WebGL for GPU compute and render
fn init_webgl(width: u32, height: u32) -> Result<(), JsValue> {
  // Get canvas
  let canvas = CANVAS
    .with(|c| c.borrow().clone())
    .ok_or_else(|| JsValue::from_str("Canvas not initialized"))?;

  // Get WebGL2 context
  let gl = canvas
    .get_context("webgl2")
    .map_err(|e| JsValue::from_str(&format!("Failed to get webgl2 context: {:?}", e)))?
    .and_then(|obj| obj.dyn_into::<WebGl2RenderingContext>().ok())
    .ok_or_else(|| JsValue::from_str("Failed to get WebGL2 rendering context"))?;

  // Store WebGL context
  GL_CONTEXT.with(|c| {
    *c.borrow_mut() = Some(gl);
  });

  // Get WebGL context back
  let gl = GL_CONTEXT
    .with(|c| c.borrow().clone())
    .ok_or_else(|| JsValue::from_str("WebGL context not available"))?;

  // Compile compute shaders
  let vert_shader = compile_shader(&gl, WebGl2RenderingContext::VERTEX_SHADER, VERTEX_SHADER)?;
  let compute_frag_shader = compile_shader(
    &gl,
    WebGl2RenderingContext::FRAGMENT_SHADER,
    COMPUTE_FRAGMENT_SHADER,
  )?;

  // Link compute program
  let compute_program = link_program(&gl, &vert_shader, &compute_frag_shader)?;
  COMPUTE_PROGRAM.with(|p| {
    *p.borrow_mut() = Some(compute_program.clone());
  });

  // Compile render shaders
  let render_frag_shader = compile_shader(
    &gl,
    WebGl2RenderingContext::FRAGMENT_SHADER,
    RENDER_FRAGMENT_SHADER,
  )?;

  // Link render program
  let render_program = link_program(&gl, &vert_shader, &render_frag_shader)?;
  RENDER_PROGRAM.with(|p| {
    *p.borrow_mut() = Some(render_program.clone());
  });

  // Get uniform locations for compute program
  let time_uniform = gl.get_uniform_location(&compute_program, "u_time");
  TIME_UNIFORM.with(|u| {
    *u.borrow_mut() = time_uniform;
  });

  let resolution_uniform = gl.get_uniform_location(&compute_program, "u_resolution");
  RESOLUTION_UNIFORM.with(|u| {
    *u.borrow_mut() = resolution_uniform;
  });

  // Get uniform location for previous frame texture in compute shader
  let previous_texture_uniform = gl.get_uniform_location(&compute_program, "u_previousFrame");
  PREVIOUS_TEXTURE_UNIFORM.with(|u| {
    *u.borrow_mut() = previous_texture_uniform;
  });

  // Render program uniforms are retrieved on-demand in render_frame_gpu

  // Set viewport
  gl.viewport(0, 0, width as i32, height as i32);

  // Create vertex buffer for full-screen quad
  let vertex_buffer = create_quad_vertices(&gl)?;
  VERTEX_BUFFER.with(|v| {
    *v.borrow_mut() = Some(vertex_buffer);
  });

  // Helper function to create a texture with proper parameters
  let create_texture = |gl: &WebGl2RenderingContext,
                        width: i32,
                        height: i32|
   -> Result<web_sys::WebGlTexture, JsValue> {
    let texture = gl
      .create_texture()
      .ok_or_else(|| JsValue::from_str("Failed to create texture"))?;
    gl.bind_texture(WebGl2RenderingContext::TEXTURE_2D, Some(&texture));
    gl.tex_image_2d_with_i32_and_i32_and_i32_and_format_and_type_and_opt_array_buffer_view(
      WebGl2RenderingContext::TEXTURE_2D,
      0,
      WebGl2RenderingContext::RGBA as i32,
      width,
      height,
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
  };

  // Create double-buffered compute textures
  let compute_texture_a = create_texture(&gl, width as i32, height as i32)?;
  let compute_texture_b = create_texture(&gl, width as i32, height as i32)?;

  COMPUTE_TEXTURE_A.with(|t| {
    *t.borrow_mut() = Some(compute_texture_a.clone());
  });
  COMPUTE_TEXTURE_B.with(|t| {
    *t.borrow_mut() = Some(compute_texture_b.clone());
  });

  // Create framebuffer A
  let compute_framebuffer_a = gl
    .create_framebuffer()
    .ok_or_else(|| JsValue::from_str("Failed to create compute framebuffer A"))?;
  gl.bind_framebuffer(
    WebGl2RenderingContext::FRAMEBUFFER,
    Some(&compute_framebuffer_a),
  );
  gl.framebuffer_texture_2d(
    WebGl2RenderingContext::FRAMEBUFFER,
    WebGl2RenderingContext::COLOR_ATTACHMENT0,
    WebGl2RenderingContext::TEXTURE_2D,
    Some(&compute_texture_a),
    0,
  );

  // Create framebuffer B
  let compute_framebuffer_b = gl
    .create_framebuffer()
    .ok_or_else(|| JsValue::from_str("Failed to create compute framebuffer B"))?;
  gl.bind_framebuffer(
    WebGl2RenderingContext::FRAMEBUFFER,
    Some(&compute_framebuffer_b),
  );
  gl.framebuffer_texture_2d(
    WebGl2RenderingContext::FRAMEBUFFER,
    WebGl2RenderingContext::COLOR_ATTACHMENT0,
    WebGl2RenderingContext::TEXTURE_2D,
    Some(&compute_texture_b),
    0,
  );

  COMPUTE_FRAMEBUFFER_A.with(|f| {
    *f.borrow_mut() = Some(compute_framebuffer_a);
  });
  COMPUTE_FRAMEBUFFER_B.with(|f| {
    *f.borrow_mut() = Some(compute_framebuffer_b);
  });

  log::info!(
    "WebGL initialized for simulation with size {}x{}",
    width,
    height
  );

  Ok(())
}

// Helper function to check if buffer, canvas, and dimensions are ready and start the loop
fn try_start_simulation_loop() {
  let buffer_ready = SHARED_BUFFER.with(|b| b.borrow().is_some());
  let canvas_ready = CANVAS.with(|c| c.borrow().is_some());
  let width = SIMULATION_WIDTH.with(|w| *w.borrow());
  let height = SIMULATION_HEIGHT.with(|h| *h.borrow());
  let dimensions_ready = width > 0 && height > 0;

  if buffer_ready && canvas_ready && dimensions_ready {
    // Check if loop is already running
    let is_running = SIMULATION_STATE.with(|state| {
      if let Some(ref s) = *state.borrow() {
        s.is_running
      } else {
        false
      }
    });

    if !is_running {
      // Get the buffer JsValue
      if let Some(buffer) = SHARED_BUFFER.with(|b| b.borrow().clone()) {
        if let Err(e) = start_simulation_loop(buffer, width, height) {
          log::error!("Failed to auto-start simulation loop: {:?}", e);
        }
      }
    }
  }
}

fn start_simulation_loop(
  buffer: JsValue, // SharedArrayBuffer as JsValue
  width: u32,
  height: u32,
) -> Result<(), JsValue> {
  let worker: DedicatedWorkerGlobalScope = js_sys::global()
    .dyn_into()
    .map_err(|_| JsValue::from_str("Failed to get worker global scope"))?;

  // Stop any existing loop
  stop_simulation_loop().ok();

  // Get current time in milliseconds
  let start_time = js_sys::Date::now();

  // Create closure for the simulation loop
  let closure = Rc::new(RefCell::new(None::<Closure<dyn FnMut()>>));
  let closure_for_callback = closure.clone();
  let closure_for_state = closure.clone();
  let closure_for_start = closure.clone();

  let simulation_closure = Closure::wrap(Box::new(move || {
    let mut should_continue = false;
    let mut width = 0;
    let mut height = 0;
    let mut start_time = 0.0;
    let mut buffer_val = JsValue::NULL;
    let mut frame_count = 0;
    let mut is_reading = false;

    SIMULATION_STATE.with(|state| {
      if let Some(ref s) = *state.borrow() {
        if !s.is_running {
          return;
        }
        should_continue = true;
        width = s.width;
        height = s.height;
        start_time = s.start_time;
        buffer_val = s.buffer.clone();
        frame_count = s.frame_count;
        is_reading = s.is_reading;
      }
    });

    if !should_continue {
      return;
    }

    // Calculate elapsed time in seconds
    let current_time = js_sys::Date::now();
    let elapsed = (current_time - start_time) / 1000.0;

    // Compute frame on GPU (writes to compute texture)
    if let Err(e) = compute_frame_gpu(width, height, elapsed) {
      log::error!("Error computing frame on GPU: {:?}", e);
      return;
    }

    // Render frame from compute texture to canvas
    if let Err(e) = render_frame_gpu(width, height, elapsed) {
      log::error!("Error rendering frame: {:?}", e);
      return;
    }

    // Increment frame count
    frame_count += 1;

    // Periodically update SharedArrayBuffer (non-blocking)
    let update_interval = UPDATE_INTERVAL.with(|i| *i.borrow());
    if frame_count % update_interval == 0 && !is_reading {
      SIMULATION_STATE.with(|state| {
        if let Some(ref mut s) = *state.borrow_mut() {
          s.is_reading = true;
        }
      });

      // Defer readPixels to avoid blocking the render loop
      // Use setTimeout for this async operation (not part of render loop)
      let buffer_clone = buffer_val.clone();
      let width_clone = width;
      let height_clone = height;
      let frame_clone = frame_count;

      let read_closure = Closure::once_into_js(move || {
        let worker_inner: DedicatedWorkerGlobalScope = js_sys::global().dyn_into().unwrap();
        update_shared_buffer_async(
          &worker_inner,
          buffer_clone,
          width_clone,
          height_clone,
          frame_clone,
        );
      });

      // Get worker again for setTimeout (not moved into closure)
      let worker_for_timeout: DedicatedWorkerGlobalScope = js_sys::global().dyn_into().unwrap();
      let _timeout_id = worker_for_timeout
        .set_timeout_with_callback_and_timeout_and_arguments_0(
          read_closure.as_ref().unchecked_ref(),
          0,
        )
        .unwrap_or_else(|e| {
          log::error!("Failed to schedule buffer update: {:?}", e);
          SIMULATION_STATE.with(|state| {
            if let Some(ref mut s) = *state.borrow_mut() {
              s.is_reading = false;
            }
          });
          -1i32
        });
    }

    // Update frame count in state
    SIMULATION_STATE.with(|state| {
      if let Some(ref mut s) = *state.borrow_mut() {
        s.frame_count = frame_count;
      }
    });

    // Schedule next iteration using requestAnimationFrame
    if should_continue {
      // Use requestAnimationFrame from the worker global scope
      // This is available in modern browsers for OffscreenCanvas workers
      let global = js_sys::global();
      let raf_fn = js_sys::Reflect::get(&global, &"requestAnimationFrame".into())
        .ok()
        .and_then(|v| v.dyn_into::<js_sys::Function>().ok());

      if let Some(request_animation_frame) = raf_fn {
        let animation_frame_id = request_animation_frame
          .call1(
            &global,
            closure_for_callback
              .borrow()
              .as_ref()
              .unwrap()
              .as_ref()
              .unchecked_ref(),
          )
          .ok()
          .and_then(|v| v.as_f64())
          .map(|v| v as u32)
          .unwrap_or(0);

        SIMULATION_STATE.with(|state| {
          if let Some(ref mut s) = *state.borrow_mut() {
            s.animation_frame_id = Some(animation_frame_id);
          }
        });
      } else {
        // Fallback to setTimeout if requestAnimationFrame is not available
        let worker_inner: DedicatedWorkerGlobalScope = js_sys::global().dyn_into().unwrap();
        let timeout_id = worker_inner
          .set_timeout_with_callback_and_timeout_and_arguments_0(
            closure_for_callback
              .borrow()
              .as_ref()
              .unwrap()
              .as_ref()
              .unchecked_ref(),
            16, // ~60fps
          )
          .unwrap_or(-1);

        SIMULATION_STATE.with(|state| {
          if let Some(ref mut s) = *state.borrow_mut() {
            // Store as animation_frame_id for consistency (even though it's a timeout)
            s.animation_frame_id = Some(timeout_id as u32);
          }
        });
      }
    }
  }) as Box<dyn FnMut()>);

  // Store the closure
  *closure_for_state.borrow_mut() = Some(simulation_closure);

  // Initialize state
  let state = SimulationState {
    buffer: buffer,
    width,
    height,
    start_time,
    is_running: true,
    frame_count: 0,
    is_reading: false,
    closure: closure_for_state,
    animation_frame_id: None,
  };

  SIMULATION_STATE.with(|s| {
    *s.borrow_mut() = Some(state);
  });

  // Start the loop using requestAnimationFrame
  let global = js_sys::global();
  let raf_fn = js_sys::Reflect::get(&global, &"requestAnimationFrame".into())
    .ok()
    .and_then(|v| v.dyn_into::<js_sys::Function>().ok());

  let animation_frame_id = if let Some(request_animation_frame) = raf_fn {
    request_animation_frame
      .call1(
        &global,
        closure_for_start
          .borrow()
          .as_ref()
          .unwrap()
          .as_ref()
          .unchecked_ref(),
      )
      .ok()
      .and_then(|v| v.as_f64())
      .map(|v| v as u32)
      .ok_or_else(|| JsValue::from_str("Failed to call requestAnimationFrame"))?
  } else {
    // Fallback to setTimeout if requestAnimationFrame is not available
    let timeout_id = worker
      .set_timeout_with_callback_and_timeout_and_arguments_0(
        closure_for_start
          .borrow()
          .as_ref()
          .unwrap()
          .as_ref()
          .unchecked_ref(),
        16, // ~60fps
      )
      .map_err(|e| JsValue::from_str(&format!("Failed to start timeout: {:?}", e)))?;
    timeout_id as u32
  };

  SIMULATION_STATE.with(|s| {
    if let Some(ref mut state) = *s.borrow_mut() {
      state.animation_frame_id = Some(animation_frame_id);
    }
  });

  log::info!("Simulation loop started");

  Ok(())
}

#[wasm_bindgen]
pub fn stop_simulation_loop() -> Result<(), JsValue> {
  SIMULATION_STATE.with(|state| {
    if let Some(ref mut s) = *state.borrow_mut() {
      s.is_running = false;
      if let Some(animation_frame_id) = s.animation_frame_id.take() {
        // Cancel the animation frame or timeout
        let global = js_sys::global();
        let cancel_raf_fn = js_sys::Reflect::get(&global, &"cancelAnimationFrame".into())
          .ok()
          .and_then(|v| v.dyn_into::<js_sys::Function>().ok());

        if let Some(cancel_animation_frame) = cancel_raf_fn {
          // Use cancelAnimationFrame
          let _ = cancel_animation_frame.call1(&global, &(animation_frame_id as f64).into());
        } else {
          // Fallback to clearTimeout
          if let Ok(worker) = global.dyn_into::<DedicatedWorkerGlobalScope>() {
            worker.clear_timeout_with_handle(animation_frame_id as i32);
          }
        }
      }
      s.closure.borrow_mut().take();
    }
  });

  log::info!("Simulation loop stopped");

  Ok(())
}

// GPU compute frame using WebGL shaders
fn compute_frame_gpu(width: u32, height: u32, time: f64) -> Result<(), JsValue> {
  // Ensure WebGL is initialized before trying to use it
  if GL_CONTEXT.with(|c| c.borrow().is_none()) || COMPUTE_PROGRAM.with(|p| p.borrow().is_none()) {
    init_webgl(width, height)?;
  }

  // Get WebGL context
  let gl = GL_CONTEXT
    .with(|c| c.borrow().clone())
    .ok_or_else(|| JsValue::from_str("WebGL context not initialized"))?;

  // Get compute shader program and uniforms
  let compute_program = COMPUTE_PROGRAM
    .with(|p| p.borrow().clone())
    .ok_or_else(|| JsValue::from_str("Compute shader program not initialized"))?;

  let time_uniform = TIME_UNIFORM.with(|u| u.borrow().clone());
  let resolution_uniform = RESOLUTION_UNIFORM.with(|u| u.borrow().clone());
  let previous_texture_uniform = PREVIOUS_TEXTURE_UNIFORM.with(|u| u.borrow().clone());
  let vertex_buffer = VERTEX_BUFFER.with(|v| v.borrow().clone());

  // Determine which buffers to use
  let current_read_buffer = CURRENT_READ_BUFFER.with(|b| *b.borrow());

  // Read buffer (read from) - previous frame's result
  let read_texture = match current_read_buffer {
    BufferSide::A => COMPUTE_TEXTURE_A.with(|t| t.borrow().clone()),
    BufferSide::B => COMPUTE_TEXTURE_B.with(|t| t.borrow().clone()),
  }
  .ok_or_else(|| JsValue::from_str("Read texture not initialized"))?;

  // Write buffer (write to) - current frame's result
  let write_framebuffer = match current_read_buffer {
    BufferSide::A => COMPUTE_FRAMEBUFFER_B.with(|f| f.borrow().clone()),
    BufferSide::B => COMPUTE_FRAMEBUFFER_A.with(|f| f.borrow().clone()),
  }
  .ok_or_else(|| JsValue::from_str("Write framebuffer not initialized"))?;

  // Bind write framebuffer for writing
  gl.bind_framebuffer(
    WebGl2RenderingContext::FRAMEBUFFER,
    Some(&write_framebuffer),
  );

  // Clear and set viewport
  gl.viewport(0, 0, width as i32, height as i32);
  gl.clear_color(0.0, 0.0, 0.0, 1.0);
  gl.clear(WebGl2RenderingContext::COLOR_BUFFER_BIT);

  // Use compute shader program
  gl.use_program(Some(&compute_program));

  // Set uniforms
  if let Some(ref time_loc) = time_uniform {
    gl.uniform1f(Some(time_loc), time as f32);
  }

  if let Some(ref res_loc) = resolution_uniform {
    gl.uniform2f(Some(res_loc), width as f32, height as f32);
  }

  // Bind read texture (previous frame) for reading
  gl.active_texture(WebGl2RenderingContext::TEXTURE0);
  gl.bind_texture(WebGl2RenderingContext::TEXTURE_2D, Some(&read_texture));

  if let Some(ref prev_tex_loc) = previous_texture_uniform {
    gl.uniform1i(Some(prev_tex_loc), 0);
  }

  // Bind vertex buffer
  gl.bind_buffer(WebGl2RenderingContext::ARRAY_BUFFER, vertex_buffer.as_ref());

  // Set up vertex attribute
  let position_location = gl.get_attrib_location(&compute_program, "a_position");
  gl.enable_vertex_attrib_array(position_location as u32);
  gl.vertex_attrib_pointer_with_i32(
    position_location as u32,
    2,
    WebGl2RenderingContext::FLOAT,
    false,
    0,
    0,
  );

  // Draw full-screen quad to write buffer
  gl.draw_arrays(WebGl2RenderingContext::TRIANGLES, 0, 6);

  // Swap buffers for next frame (what we just wrote to becomes the new read buffer)
  let new_read_buffer = current_read_buffer.swap();
  CURRENT_READ_BUFFER.with(|b| {
    *b.borrow_mut() = new_read_buffer;
  });

  Ok(())
}

// Render frame using compute texture
fn render_frame_gpu(width: u32, height: u32, time: f64) -> Result<(), JsValue> {
  // Get WebGL context
  let gl = GL_CONTEXT
    .with(|c| c.borrow().clone())
    .ok_or_else(|| JsValue::from_str("WebGL context not initialized"))?;

  // Get render shader program
  let render_program = RENDER_PROGRAM
    .with(|p| p.borrow().clone())
    .ok_or_else(|| JsValue::from_str("Render shader program not initialized"))?;

  // Get the current read buffer (the one we just wrote to in compute_frame_gpu)
  // Note: compute_frame_gpu already swapped, so this is now the read buffer
  let current_read_buffer = CURRENT_READ_BUFFER.with(|b| *b.borrow());
  let compute_texture = match current_read_buffer {
    BufferSide::A => COMPUTE_TEXTURE_A.with(|t| t.borrow().clone()),
    BufferSide::B => COMPUTE_TEXTURE_B.with(|t| t.borrow().clone()),
  }
  .ok_or_else(|| JsValue::from_str("Compute texture not initialized"))?;

  let vertex_buffer = VERTEX_BUFFER.with(|v| v.borrow().clone());

  // Bind to default framebuffer (canvas)
  gl.bind_framebuffer(WebGl2RenderingContext::FRAMEBUFFER, None);

  // Clear and set viewport
  gl.viewport(0, 0, width as i32, height as i32);
  gl.clear_color(0.0, 0.0, 0.0, 1.0);
  gl.clear(WebGl2RenderingContext::COLOR_BUFFER_BIT);

  // Use render shader program
  gl.use_program(Some(&render_program));

  // Set uniforms
  let render_time_uniform = gl.get_uniform_location(&render_program, "u_time");
  if let Some(ref time_loc) = render_time_uniform {
    gl.uniform1f(Some(time_loc), time as f32);
  }

  let render_resolution_uniform = gl.get_uniform_location(&render_program, "u_resolution");
  if let Some(ref res_loc) = render_resolution_uniform {
    gl.uniform2f(Some(res_loc), width as f32, height as f32);
  }

  // Bind compute texture
  gl.active_texture(WebGl2RenderingContext::TEXTURE0);
  gl.bind_texture(WebGl2RenderingContext::TEXTURE_2D, Some(&compute_texture));

  // Set texture uniform
  let compute_texture_uniform = gl.get_uniform_location(&render_program, "u_computeTexture");
  if let Some(ref tex_loc) = compute_texture_uniform {
    gl.uniform1i(Some(tex_loc), 0);
  }

  // Bind vertex buffer
  gl.bind_buffer(WebGl2RenderingContext::ARRAY_BUFFER, vertex_buffer.as_ref());

  // Set up vertex attribute
  let position_location = gl.get_attrib_location(&render_program, "a_position");
  gl.enable_vertex_attrib_array(position_location as u32);
  gl.vertex_attrib_pointer_with_i32(
    position_location as u32,
    2,
    WebGl2RenderingContext::FLOAT,
    false,
    0,
    0,
  );

  // Draw full-screen quad
  gl.draw_arrays(WebGl2RenderingContext::TRIANGLES, 0, 6);

  Ok(())
}

// Periodically read pixels from compute texture and update SharedArrayBuffer
fn update_shared_buffer_async(
  _worker: &DedicatedWorkerGlobalScope,
  buffer: JsValue,
  width: u32,
  height: u32,
  frame: u32,
) {
  // Get WebGL context
  let gl = match GL_CONTEXT.with(|c| c.borrow().clone()) {
    Some(gl) => gl,
    None => {
      log::error!("WebGL context not available for buffer update");
      return;
    }
  };

  // Get the current read buffer to read from
  let current_read_buffer = CURRENT_READ_BUFFER.with(|b| *b.borrow());
  let compute_framebuffer = match current_read_buffer {
    BufferSide::A => COMPUTE_FRAMEBUFFER_A.with(|f| f.borrow().clone()),
    BufferSide::B => COMPUTE_FRAMEBUFFER_B.with(|f| f.borrow().clone()),
  };

  gl.bind_framebuffer(
    WebGl2RenderingContext::FRAMEBUFFER,
    compute_framebuffer.as_ref(),
  );

  // Read pixels back from framebuffer
  let mut pixels = vec![0u8; (width * height * 4) as usize];
  if let Err(e) = gl.read_pixels_with_opt_u8_array(
    0,
    0,
    width as i32,
    height as i32,
    WebGl2RenderingContext::RGBA,
    WebGl2RenderingContext::UNSIGNED_BYTE,
    Some(&mut pixels),
  ) {
    log::error!("Failed to read pixels: {:?}", e);
    SIMULATION_STATE.with(|state| {
      if let Some(ref mut s) = *state.borrow_mut() {
        s.is_reading = false;
      }
    });
    return;
  }

  // Convert SharedArrayBuffer to Uint8Array
  let uint8_array = Uint8Array::new(&buffer);
  let mut buffer_slice = vec![0u8; uint8_array.length() as usize];
  uint8_array.copy_to(&mut buffer_slice);

  // Copy pixels to buffer (flip Y axis since OpenGL reads bottom-to-top)
  for y in 0..height {
    let src_y = (height - 1 - y) as usize;
    for x in 0..width {
      let src_idx = (src_y * width as usize + x as usize) * 4;
      let dst_idx = (y * width + x) as usize * 4;

      if dst_idx + 3 < buffer_slice.len() {
        buffer_slice[dst_idx] = pixels[src_idx];
        buffer_slice[dst_idx + 1] = pixels[src_idx + 1];
        buffer_slice[dst_idx + 2] = pixels[src_idx + 2];
        buffer_slice[dst_idx + 3] = pixels[src_idx + 3];
      }
    }
  }

  // Copy back to SharedArrayBuffer
  uint8_array.copy_from(&buffer_slice);

  // Mark reading as complete
  SIMULATION_STATE.with(|state| {
    if let Some(ref mut s) = *state.borrow_mut() {
      s.is_reading = false;
    }
  });

  // Post message to main thread using DedicatedWorkerGlobalScope
  let message = js_sys::Object::new();
  js_sys::Reflect::set(&message, &"type".into(), &"bufferUpdated".into()).unwrap();
  js_sys::Reflect::set(&message, &"frame".into(), &(frame as f64).into()).unwrap();
  js_sys::Reflect::set(&message, &"timestamp".into(), &js_sys::Date::now().into()).unwrap();

  // Get worker global scope and post message
  if let Ok(worker_global) = js_sys::global().dyn_into::<DedicatedWorkerGlobalScope>() {
    let _ = worker_global.post_message(&message).map_err(|e| {
      log::error!("Failed to post message: {:?}", e);
    });
  } else {
    log::warn!("Not in a worker context, cannot post message");
  }

  log::debug!("SharedArrayBuffer updated at frame {}", frame);
}
