struct Uniforms {
  width: u32,
  height: u32,
  cell_size: u32,
  cell_count: u32,
  genotype_size: u32,
  phenotype_size: u32,
  epistasis_gain: f32,
  phenotype_gain: f32,
  regional_env_count: u32,
  regional_env_overlap: f32,
  regional_env_epi_gain: f32,
  global_env_epi_gain: f32,
}

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read> regional_env_fit_topology: array<f32>;
@group(0) @binding(2) var<storage, read> phenotype_weights: array<f32>;
@group(0) @binding(3) var<storage, read> fitness_scores: array<f32>;

struct FragmentInput {
  @builtin(position) fragCoord: vec4<f32>,
}

fn get_cell_index_for_pixel(pixel_xy: vec2<f32>) -> u32 {
  let cell_grid_width = u.width / u.cell_size;
  let cell_grid_height = u.height / u.cell_size;
  if (cell_grid_width == 0u || cell_grid_height == 0u) {
    return 0u;
  }
  let cell_x = min(u32(pixel_xy.x) / u.cell_size, cell_grid_width - 1u);
  let cell_y = min(u32(pixel_xy.y) / u.cell_size, cell_grid_height - 1u);
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


/**
 * The color represents how fit the cell is according to it's environment.
 * At this stage we have R + 1 scores for each cell, which is there relative
 * fitness to each of the R regional environments and the global environment.
 *
 * We first calculate the base color for the cell based on it's distance to
 * the regional environments. The fitness score is then used to determine the
 * strength of that color. We also have the global environment fitness score,
 * which we'll map to the alpha channel.
 */
@fragment
fn main(input: FragmentInput) -> @location(0) vec4<f32> {
  // Convert pixel coordinates to cell coordinates
  let cell_index = get_cell_index_for_pixel(input.fragCoord.xy);
  let cell_position = get_cell_position_for_pixel(input.fragCoord.xy);

 var color = vec4<f32>(0.0, 0.0, 0.0, 0.0);

  color += get_color_for_cell_distance_to_regional_envs(cell_index, cell_position);
  color += get_color_for_global_environment_fitness_score(cell_index);

  return color;
}

fn get_color_for_cell_distance_to_regional_envs(cell_index: u32, cell_position: vec2<f32>) -> vec4<f32> {
  // Topology parsing (CSR)
  // We currently generate exactly 1 topology for this buffer.
  let topology_offset = u32(regional_env_fit_topology[1u]);
  let metadata_count = u32(regional_env_fit_topology[topology_offset]);
  let metadata_offset = topology_offset + 1u;
  let node_count = u32(regional_env_fit_topology[metadata_offset + metadata_count]);

  if (node_count == 0u) {
    return vec4<f32>(0.0, 0.0, 0.0, 0.0);
  }

  // [x, y, r, R, G, B].
  let metadata_stride = metadata_count / node_count;
  let fitness_stride = node_count + 1u;
  let fitness_offset = cell_index * fitness_stride;

  var color = vec3<f32>(0.0, 0.0, 0.0);
  var total_weight = 0.0;

  for (var node_index: u32 = 0; node_index < node_count; node_index++) {
    if (node_index == 3u) {
      continue;
    }


    let metadata_base = metadata_offset + node_index * metadata_stride;
    let region_x = regional_env_fit_topology[metadata_base];
    let region_y = regional_env_fit_topology[metadata_base + 1u];
    let region_r_inner = regional_env_fit_topology[metadata_base + 2u];
    let region_r = region_r_inner * (1.0 + u.regional_env_overlap);

    let cell_distance = distance(cell_position, vec2(region_x, region_y));

    if (cell_distance > region_r) {
      continue;
    }

    let region_color_r = regional_env_fit_topology[metadata_base + 3u];
    let region_color_g = regional_env_fit_topology[metadata_base + 4u];
    let region_color_b = regional_env_fit_topology[metadata_base + 5u];
    let region_color = vec3<f32>(region_color_r, region_color_g, region_color_b);

    let overlap_scale = clamp((cell_distance - region_r_inner) / (region_r - region_r_inner), 0.0, 1.0);
    let distance_weight = 1.0 - overlap_scale;

    let fitness_weight = fitness_scores[fitness_offset + node_index];
    let contribution_weight = distance_weight * fitness_weight;

    color += region_color * contribution_weight;
    total_weight += contribution_weight;
  }

  if (total_weight > 0.0) {
    color = color / total_weight;
  }

  return vec4<f32>(color, 0.0);
}

fn get_color_for_global_environment_fitness_score(cell_index: u32) -> vec4<f32> {
  let fitness_stride = u.regional_env_count + 1u;
  let fitness_offset = cell_index * fitness_stride;
  let fitness_score = fitness_scores[fitness_offset + u.regional_env_count];

  return vec4<f32>(0.0, 0.0, 0.0, fitness_score);
}
