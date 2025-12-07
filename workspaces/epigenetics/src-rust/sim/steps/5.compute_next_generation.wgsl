struct Uniforms {
  width: u32,
  height: u32,
  cell_size: u32,
  cell_count: u32,
  genotype_size: u32,
  phenotype_size: u32,
  epistasis_gain: f32,
  phenotype_gain: f32,
  local_environment_gain: f32,
  local_environment_effect_radius: u32,
  regional_environment_gain: f32,
  global_environment_gain: f32,
}

@group(0) @binding(0) var<uniform> u: Uniforms;

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {

}
