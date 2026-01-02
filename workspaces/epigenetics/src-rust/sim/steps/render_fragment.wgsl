struct Uniforms {
  width: u32,
  height: u32,
  cell_size: u32,
  cell_count: u32,
  partnership_opportunities_max: u32,
  partnership_fitness_amplification: f32,
  partnership_monogamy_amplification: f32,
  genotype_size: u32,
  phenotype_size: u32,
  epistasis_enabled: u32,
  epistasis_gain: f32,
  phenotype_gain: f32,
  regional_env_enabled: u32,
  regional_env_count: u32,
  regional_env_overlap: f32,
  regional_env_epi_gain: f32,
  global_env_enabled: u32,
  global_env_epi_gain: f32,
}

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read> regional_env_fit_topology: array<f32>;
@group(0) @binding(2) var<storage, read> phenotype_weights: array<f32>;
@group(0) @binding(3) var<storage, read> fitness_scores: array<f32>;

struct FragmentInput {
  @builtin(position) fragCoord: vec4<f32>,
}

/**
 * The color represents how fit the cell is according to its environment.
 * We use 4 fitness scores to shift the base color:
 * - n1: hue shift (from regional environments)
 * - n2: saturation shift (from regional environments)
 * - n3: value/brightness shift (from regional environments)
 * - n4: RGB inversion blend (from global environment)
 */
@fragment
fn main(input: FragmentInput) -> @location(0) vec4<f32> {
  // Convert pixel coordinates to cell coordinates
  let cell_index = get_cell_index_for_pixel(input.fragCoord.xy);
  let cell_position = get_cell_position_for_pixel(input.fragCoord.xy);

  // Get base color from regional environments
  let base_color = get_base_color_for_cell(cell_index, cell_position);

  // Get 4 fitness scores for color shifting
  let fitness_stride = u.regional_env_count + 1u;
  let fitness_offset = cell_index * fitness_stride;

  // Use first 4 fitness scores (or pad with 1.0 if not enough)
  let n1 = fitness_scores[fitness_offset + 0u];
  let n2 = fitness_scores[fitness_offset + 1u];
  let n3 = fitness_scores[fitness_offset + 2u];
  let n4 = fitness_scores[fitness_offset + u.regional_env_count]; // Global environment score

  let n = (n1 + n2 + n3 + n4) / 4.0;

  // Apply color shift
  let shifted_color = shift_color(base_color, n, n, n, n);

  // Use alpha from global environment fitness score
  return vec4<f32>(shifted_color, n);
}

fn get_cell_index_for_pixel(pixel_xy: vec2<f32>) -> u32 {
  let cell_grid_width = u.width / u.cell_size;
  let cell_grid_height = u.height / u.cell_size;
  if (cell_grid_width == 0u || cell_grid_height == 0u) {
    return 0u;
  }
  // Distribute pixels evenly across cells
  let cell_x = min((u32(pixel_xy.x) * cell_grid_width) / u.width, cell_grid_width - 1u);
  let cell_y = min((u32(pixel_xy.y) * cell_grid_height) / u.height, cell_grid_height - 1u);
  return cell_x + cell_y * cell_grid_width;
}

fn get_cell_position_for_pixel(pixel_xy: vec2<f32>) -> vec2<f32> {
  let cell_index = get_cell_index_for_pixel(pixel_xy);
  let cell_grid_width = f32(u.width / u.cell_size);
  let cell_grid_height = f32(u.height / u.cell_size);
  let cell_x = f32(cell_index % u32(cell_grid_width));
  let cell_y = f32(cell_index / u32(cell_grid_width));

  // Return normalized coordinates (0..1) to match region positions
  return vec2<f32>(
    (cell_x + 0.5) / cell_grid_width,
    (cell_y + 0.5) / cell_grid_height,
  );
}

fn get_base_color_for_cell(cell_index: u32, cell_position: vec2<f32>) -> vec3<f32> {
  // Topology parsing (CSR)
  // We currently generate exactly 1 topology for this buffer.
  let topology_offset = u32(regional_env_fit_topology[1u]);
  let metadata_count = u32(regional_env_fit_topology[topology_offset]);
  let metadata_offset = topology_offset + 1u;
  let node_count = u32(regional_env_fit_topology[metadata_offset + metadata_count]);

  if (node_count == 0u) {
    return vec3<f32>(0.0, 0.0, 0.0); // Default gray
  }

  // [x, y, r, R, G, B].
  let metadata_stride = metadata_count / node_count;
  let fitness_stride = node_count + 1u;
  let fitness_offset = cell_index * fitness_stride;

  var color = vec3<f32>(0.0, 0.0, 0.0);
  var total_weight = 0.0;

  for (var node_index: u32 = 0; node_index < node_count; node_index++) {
    let metadata_base = metadata_offset + node_index * metadata_stride;
    let region_x = regional_env_fit_topology[metadata_base + 0u];
    let region_y = regional_env_fit_topology[metadata_base + 1u];
    let region_r = regional_env_fit_topology[metadata_base + 2u];
    let region_r_ext = region_r * (1.0 + u.regional_env_overlap);

    let cell_distance = distance(cell_position, vec2(region_x, region_y));

    if (cell_distance > region_r_ext) {
      continue;
    }

    let region_color_r = regional_env_fit_topology[metadata_base + 3u];
    let region_color_g = regional_env_fit_topology[metadata_base + 4u];
    let region_color_b = regional_env_fit_topology[metadata_base + 5u];
    let region_color = vec3<f32>(region_color_r, region_color_g, region_color_b);

    let overlap_scale = clamp((cell_distance - region_r) / (region_r_ext - region_r), 0.0, 1.0);
    let distance_weight = 1.0 - overlap_scale;

    let fitness_weight = fitness_scores[fitness_offset + node_index];
    let contribution_weight = distance_weight * fitness_weight;

    color += region_color * contribution_weight;
    total_weight += contribution_weight;
  }

  if (total_weight <= 0.0) {
    return vec3<f32>(0.0, 0.0, 0.0);
  }

  return color / total_weight;
}

// Apply 4-parameter color shift
// n1: hue shift (0 = 180° shift, 1 = no shift)
// n2: saturation shift (0 = desaturated, 1 = original)
// n3: value shift (0 = black, 1 = original)
// n4: RGB inversion blend (0 = inverted, 1 = original)
fn shift_color(base_color: vec3<f32>, n1: f32, n2: f32, n3: f32, n4: f32) -> vec3<f32> {
  // Early return if all parameters are 1.0 (no shift)
  if (n1 == 1.0 && n2 == 1.0 && n3 == 1.0 && n4 == 1.0) {
    return base_color;
  }

  // Convert to HSV
  var hsv = rgb_to_hsv(base_color);

  // Apply hue shift: H = H₀ + (1-n₁) * 0.5
  // When n1=0, shifts 180° (0.5 in normalized hue)
  // When n1=1, no shift
  if (n1 != 1.0) {
    let h_shifted = hsv.x + (1.0 - n1) * 0.5;
    hsv.x = h_shifted - floor(h_shifted); // Manual modulo 1.0
  }

  // Apply saturation shift: S = S₀ * n₂
  // When n2=0, desaturated (gray)
  // When n2=1, original saturation
  if (n2 != 1.0) {
    hsv.y = hsv.y * n2;
  }

  // Apply value shift: V = V₀ * n₃
  // When n3=0, black
  // When n3=1, original brightness
  if (n3 != 1.0) {
    hsv.z = hsv.z * n3;
  }

  // Convert back to RGB
  var shifted_rgb = hsv_to_rgb(hsv);

  // Apply RGB inversion blend: lerp between inverted and original
  // When n4=0, fully inverted (opposite)
  // When n4=1, no change
  if (n4 != 1.0) {
    let inverted_rgb = vec3<f32>(1.0, 1.0, 1.0) - shifted_rgb;
    shifted_rgb = mix(inverted_rgb, shifted_rgb, n4);
  }

  return shifted_rgb;
}

// Convert RGB to HSV
fn rgb_to_hsv(rgb: vec3<f32>) -> vec3<f32> {
  let r = rgb.r;
  let g = rgb.g;
  let b = rgb.b;

  let max_val = max(max(r, g), b);
  let min_val = min(min(r, g), b);
  let delta = max_val - min_val;

  // Value (brightness)
  let v = max_val;

  // Saturation
  let s = select(0.0, delta / max_val, max_val > 0.0);

  // Hue
  var h: f32 = 0.0;
  if (delta > 0.0) {
    var h_raw: f32;
    if (max_val == r) {
      h_raw = ((g - b) / delta) + 6.0;
    } else if (max_val == g) {
      h_raw = ((b - r) / delta) + 2.0;
    } else {
      h_raw = ((r - g) / delta) + 4.0;
    }
    // Manual modulo: h_raw % 6.0
    h = h_raw - 6.0 * floor(h_raw / 6.0);
    h = h / 6.0;
  }

  return vec3<f32>(h, s, v);
}

// Convert HSV to RGB
fn hsv_to_rgb(hsv: vec3<f32>) -> vec3<f32> {
  let h = hsv.x;
  let s = hsv.y;
  let v = hsv.z;

  let c = v * s;
  let h6 = h * 6.0;
  // Manual modulo and abs: mod(h6, 2.0) - 1.0, then abs
  let h6_mod2 = h6 - 2.0 * floor(h6 / 2.0);
  let abs_val = select(1.0 - h6_mod2, h6_mod2 - 1.0, h6_mod2 >= 1.0);
  let x = c * abs_val;
  let m = v - c;

  var rgb: vec3<f32>;
  if (h6 < 1.0) {
    rgb = vec3<f32>(c, x, 0.0);
  } else if (h6 < 2.0) {
    rgb = vec3<f32>(x, c, 0.0);
  } else if (h6 < 3.0) {
    rgb = vec3<f32>(0.0, c, x);
  } else if (h6 < 4.0) {
    rgb = vec3<f32>(0.0, x, c);
  } else if (h6 < 5.0) {
    rgb = vec3<f32>(x, 0.0, c);
  } else {
    rgb = vec3<f32>(c, 0.0, x);
  }

  return rgb + vec3<f32>(m, m, m);
}
