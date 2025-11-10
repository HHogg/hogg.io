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

  // Sample previous frame
    let previous = textureSample(compute_texture, compute_sampler, uv);

  // Calculate normalized coordinates (matching CPU version)
    let fx = input.fragCoord.x / u_resolution.x;
    let fy = input.fragCoord.y / u_resolution.y;

  // Match the CPU computation exactly
    let angle = sin(fx * 6.28318530718 + u_time * 0.5); // 2*PI = 6.28318530718
    let dist = sqrt((fx - 0.5) * (fx - 0.5) + (fy - 0.5) * (fy - 0.5));

  // RGBA values (matching CPU version)
  // Calculate new values based on position and time
    let r = angle * 0.5 + 0.5;
    let g = sin(dist * 2.0 + u_time * 0.3) * 0.5 + 0.5;
    let b = sin(fx + fy + u_time * 0.2) * 0.5 + 0.5;
    let a = 1.0;

  // Output the gradient directly
  // Add previous * 0.0 to prevent shader compiler from optimizing away the uniform
    let gradient = vec4<f32>(r, g, b, a);
    return gradient + previous * 0.0;
}

