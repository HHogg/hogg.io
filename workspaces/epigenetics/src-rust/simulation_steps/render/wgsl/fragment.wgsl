@group(0) @binding(0) var<uniform> u_resolution: vec2<f32>;
@group(0) @binding(1) var<uniform> u_texture_size: vec3<u32>;
@group(0) @binding(2) var simulation_texture: texture_3d<f32>;
@group(0) @binding(3) var simulation_sampler: sampler;

struct FragmentInput {
  @builtin(position) fragCoord: vec4<f32>,
}

@fragment
fn main(input: FragmentInput) -> @location(0) vec4<f32> {
  let uv = input.fragCoord.xy / u_resolution;

  // Convert UV to texture coordinates
  let x = u32(uv.x * f32(u_texture_size.x));
  let y = u32(uv.y * f32(u_texture_size.y));

  // Sample all z layers and calculate average
  // R32Float texture returns a single float value
  var sum: f32 = 0.0;
  var count: f32 = 0.0;

  for (var z: u32 = 0u; z < u_texture_size.z; z++) {
    let coord = vec3<f32>(
      (f32(x) + 0.5) / f32(u_texture_size.x),
      (f32(y) + 0.5) / f32(u_texture_size.y),
      (f32(z) + 0.5) / f32(u_texture_size.z)
    );
    let sample = textureSample(simulation_texture, simulation_sampler, coord);
    sum += sample.r; // R32Float samples return the value in the .r channel
    count += 1.0;
  }

  let average = sum / count;

  // Map average to RGB color (grayscale)
  return vec4<f32>(average, average, average, 1.0);
}

