use wasm_bindgen::JsValue;
use web_sys::{WebGl2RenderingContext, WebGlShader};

use crate::utils::compile_shader;

const VERTEX_SHADER: &str = include_str!("./glsl/vertex.glsl");
const FRAGMENT_SHADER: &str = include_str!("./glsl/fragment.glsl");

pub fn create_vertex_shader(gl: &WebGl2RenderingContext) -> Result<WebGlShader, JsValue> {
  compile_shader(gl, WebGl2RenderingContext::VERTEX_SHADER, VERTEX_SHADER)
}

pub fn create_fragment_shader(gl: &WebGl2RenderingContext) -> Result<WebGlShader, JsValue> {
  compile_shader(gl, WebGl2RenderingContext::FRAGMENT_SHADER, FRAGMENT_SHADER)
}
