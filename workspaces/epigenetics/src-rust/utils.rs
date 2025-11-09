use wasm_bindgen::closure::Closure;
use wasm_bindgen::JsCast;
use wasm_bindgen::JsValue;
use web_sys::{DedicatedWorkerGlobalScope, WebGl2RenderingContext, WebGlProgram, WebGlShader};

pub fn create_quad_vertices(
  context: &WebGl2RenderingContext,
) -> Result<web_sys::WebGlBuffer, JsValue> {
  // Create a full-screen quad (two triangles)
  let vertices: [f32; 12] = [
    -1.0, -1.0, // bottom-left
    1.0, -1.0, // bottom-right
    -1.0, 1.0, // top-left
    1.0, -1.0, // bottom-right
    1.0, 1.0, // top-right
    -1.0, 1.0, // top-left
  ];

  let buffer = context
    .create_buffer()
    .ok_or_else(|| JsValue::from_str("Unable to create vertex buffer"))?;

  context.bind_buffer(WebGl2RenderingContext::ARRAY_BUFFER, Some(&buffer));

  unsafe {
    let vert_array = js_sys::Float32Array::view(&vertices);
    context.buffer_data_with_array_buffer_view(
      WebGl2RenderingContext::ARRAY_BUFFER,
      &vert_array,
      WebGl2RenderingContext::STATIC_DRAW,
    );
  }

  Ok(buffer)
}

pub fn compile_shader(
  context: &WebGl2RenderingContext,
  shader_type: u32,
  source: &str,
) -> Result<WebGlShader, JsValue> {
  let shader = context
    .create_shader(shader_type)
    .ok_or_else(|| JsValue::from_str("Unable to create shader object"))?;

  context.shader_source(&shader, source);
  context.compile_shader(&shader);

  match context
    .get_shader_parameter(&shader, WebGl2RenderingContext::COMPILE_STATUS)
    .as_bool()
  {
    Some(true) => Ok(shader),
    Some(false) => {
      let error_log = context
        .get_shader_info_log(&shader)
        .unwrap_or_else(|| "Unknown error compiling shader".into());
      Err(JsValue::from_str(&format!(
        "Failed to compile shader: {error_log}"
      )))
    }
    None => Err(JsValue::from_str("Failed to get compile status")),
  }
}

pub fn link_program(
  context: &WebGl2RenderingContext,
  vert_shader: &WebGlShader,
  frag_shader: &WebGlShader,
) -> Result<WebGlProgram, JsValue> {
  let program = context
    .create_program()
    .ok_or_else(|| JsValue::from_str("Unable to create shader program"))?;

  context.attach_shader(&program, vert_shader);
  context.attach_shader(&program, frag_shader);
  context.link_program(&program);

  match context
    .get_program_parameter(&program, WebGl2RenderingContext::LINK_STATUS)
    .as_bool()
  {
    Some(true) => Ok(program),
    Some(false) => {
      let error_log = context
        .get_program_info_log(&program)
        .unwrap_or_else(|| "Unknown error linking program".into());
      Err(JsValue::from_str(&format!(
        "Failed to link program: {error_log}"
      )))
    }
    None => Err(JsValue::from_str("Failed to get link status")),
  }
}

pub fn set_timeout<T: AsRef<JsValue>>(callback: T, timeout: u32) -> Result<u32, JsValue> {
  let global = js_sys::global();
  let worker: DedicatedWorkerGlobalScope = global
    .dyn_into()
    .map_err(|_| JsValue::from_str("Failed to get worker global scope"))?;

  let timeout_id = worker
    .set_timeout_with_callback_and_timeout_and_arguments_0(
      callback.as_ref().unchecked_ref(),
      timeout as i32,
    )
    .map_err(|e| JsValue::from_str(&format!("Failed to start timeout: {e:?}")))?;
  Ok(timeout_id as u32)
}

pub fn request_animation_frame(callback: &Closure<dyn FnMut()>) -> Result<u32, JsValue> {
  // Use requestAnimationFrame from the worker global scope
  // This is available in modern browsers for OffscreenCanvas workers
  let global = js_sys::global();
  let raf_fn = js_sys::Reflect::get(&global, &"requestAnimationFrame".into())
    .ok()
    .and_then(|v| v.dyn_into::<js_sys::Function>().ok());

  if let Some(request_animation_frame) = raf_fn {
    let animation_frame_id = request_animation_frame
      .call1(&global, callback.as_ref().unchecked_ref())
      .ok()
      .and_then(|v| v.as_f64())
      .map(|v| v as u32)
      .ok_or_else(|| JsValue::from_str("Failed to call requestAnimationFrame"))?;

    Ok(animation_frame_id)
  } else {
    // Fallback to setTimeout if requestAnimationFrame is not available
    set_timeout(callback, 16)
  }
}

pub fn clear_timeout(timeout_id: u32) -> Result<(), JsValue> {
  let global = js_sys::global();
  let cancel_raf_fn = js_sys::Reflect::get(&global, &"cancelAnimationFrame".into())
    .ok()
    .and_then(|v| v.dyn_into::<js_sys::Function>().ok());

  if let Some(cancel_animation_frame) = cancel_raf_fn {
    // Use cancelAnimationFrame
    let _ = cancel_animation_frame.call1(&global, &(timeout_id as f64).into());
  } else {
    // Fallback to clearTimeout
    if let Ok(worker) = global.dyn_into::<DedicatedWorkerGlobalScope>() {
      worker.clear_timeout_with_handle(timeout_id as i32);
    }
  }

  Ok(())
}
