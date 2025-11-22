@group(0) @binding(0) var<uniform> u_pass_index: u32;
@group(0) @binding(1) var<uniform> u_texture_size: vec3<u32>;
@group(0) @binding(2) var seed_texture: texture_2d<f32>;
@group(0) @binding(3) var read_texture: texture_storage_3d<r32float, read>;
@group(0) @binding(4) var write_texture: texture_storage_3d<r32float, write>;

// Hash function for pseudo-random number generation
fn hash(p: vec3<u32>) -> f32 {
  var p3 = vec3<f32>(f32(p.x), f32(p.y), f32(p.z));
  p3 = fract(p3 * vec3<f32>(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, vec3<f32>(p3.y + 33.0, p3.z + 33.0, p3.x + 33.0));
  return fract((p3.x + p3.y) * p3.z);
}

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let x = global_id.x;
  let y = global_id.y;
  let z = global_id.z;

  // Check bounds
  if (x >= u_texture_size.x || y >= u_texture_size.y || z >= u_texture_size.z) {
    return;
  }

  // Sample seed texture at (x, y)
  let seed_value = textureLoad(seed_texture, vec2<i32>(i32(x), i32(y)), 0).x;
  let seed_u32 = u32(seed_value * 1000000.0);

  // Create hash input from coordinates and seed
  let hash_input = vec3<u32>(x, y, z) + vec3<u32>(seed_u32, seed_u32 * 2u, seed_u32 * 3u);

  if (u_pass_index == 0u) {
    // First pass: initialize with random values 0-1
    // R32Float stores a single float value, but textureStore requires vec4
    // Only the .r component is used for R32Float format
    let random_value = hash(hash_input);
    textureStore(write_texture, vec3<i32>(i32(x), i32(y), i32(z)), vec4<f32>(random_value, 0.0, 0.0, 0.0));
  } else {
    // Subsequent passes: read from previous frame and write updated value
    let current = textureLoad(read_texture, vec3<i32>(i32(x), i32(y), i32(z)));
    let delta_hash = hash(hash_input + vec3<u32>(u_pass_index, u_pass_index * 2u, u_pass_index * 3u));
    // Increase delta to make changes more visible (range -0.05 to 0.05)
    let delta = (delta_hash - 0.5) * 0.1;

    // Update the single channel value (stored in .r for R32Float)
    let new_value = clamp(current.r + delta, 0.0, 1.0);

    textureStore(write_texture, vec3<i32>(i32(x), i32(y), i32(z)), vec4<f32>(new_value, 0.0, 0.0, 0.0));
  }
}

