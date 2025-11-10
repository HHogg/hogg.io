@group(0) @binding(0) var<uniform> u_time: f32;
@group(0) @binding(1) var<uniform> u_resolution: vec2<f32>;
@group(0) @binding(2) var compute_texture: texture_2d<f32>;
@group(0) @binding(3) var compute_sampler: sampler;

struct FragmentInput {
  @builtin(position) fragCoord: vec4<f32>,
}

@fragment
fn main(input: FragmentInput) -> @location(0) vec4<f32> {
  let uv = input.fragCoord.xy / u_resolution;

  // Sample from compute texture
  let color = textureSample(compute_texture, compute_sampler, uv);

  return color + vec4<f32>(u_time * 0.0, 0.0, 0.0, 0.0); // Prevent uniform optimization
}

