use wgpu::{Device, ShaderModule};

use crate::utils::create_shader_module;

const VERTEX_SHADER: &str = include_str!("./wgsl/vertex.wgsl");
const FRAGMENT_SHADER: &str = include_str!("./wgsl/fragment.wgsl");

pub fn create_vertex_shader(device: &Device) -> ShaderModule {
  create_shader_module(device, VERTEX_SHADER)
}

pub fn create_fragment_shader(device: &Device) -> ShaderModule {
  create_shader_module(device, FRAGMENT_SHADER)
}
