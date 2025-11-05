use wasm_bindgen::JsValue;
use web_sys::{WebGl2RenderingContext, WebGlProgram, WebGlShader};

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

  if context
    .get_shader_parameter(&shader, WebGl2RenderingContext::COMPILE_STATUS)
    .as_bool()
    .unwrap_or(false)
  {
    Ok(shader)
  } else {
    Err(
      context
        .get_shader_info_log(&shader)
        .unwrap_or_else(|| "Unknown error creating shader".into())
        .into(),
    )
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

  if context
    .get_program_parameter(&program, WebGl2RenderingContext::LINK_STATUS)
    .as_bool()
    .unwrap_or(false)
  {
    Ok(program)
  } else {
    Err(
      context
        .get_program_info_log(&program)
        .unwrap_or_else(|| "Unknown error linking program".into())
        .into(),
    )
  }
}

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
