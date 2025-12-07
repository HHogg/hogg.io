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
@group(0) @binding(1) var<storage, read> regional_environment_topology: array<f32>;
@group(0) @binding(2) var<storage, read> global_environment_topology: array<f32>;
@group(0) @binding(3) var<storage, read_write> environment_shifts: array<f32>;

/**
 * This step sums all of the environment topology influence
 * weights (scaled by the environment gain) for each cells
 * genotype which will be used in the phenotype step to compute the
 * epigenetic shifts (in log-odds space) for the phenotype.
 *
 * 1. The global environment topology is a single topology
 *    that affects all of the cells genotype weights equally.
 *    Modelling the environment that all cells experience
 * 2. The regional environments, for which there are multiple,
 *    depends on the relative position to the cell. However each
 *    topology is still a single topology that affects all of the
 *    cells genotype, but is just distance based.
 * 3. The local topology, for which there is one per cell but
 *    each cells is also affected by it's neighbors local topology,
 *    relative to the distance. For example a cells own environment
 *    influence more strongly affects it, if the nearby environment
 *    is 1 cells distance then it's 0.5 as strong, 2 cells distance
 *   then it's 0.25, and so on..
 */
@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let cell_xy = global_id.xy;
  let cell_index = get_cell_index_for_xy(cell_xy);
  let cell_offset = get_cell_offset_for_cell_index(cell_index);

  apply_regional_environment_shifts(cell_xy, cell_offset);
  apply_global_environment_shifts(cell_offset);
}

fn get_cell_index_for_xy(cell_xy: vec2<u32>) -> u32 {
  let cell_width = u.width / u.cell_size;
  return cell_xy.x + cell_xy.y * cell_width;
}

fn get_cell_offset_for_cell_index(cell_index: u32) -> u32 {
  return cell_index * u.genotype_size;
}

fn apply_regional_environment_shifts(cell_xy: vec2<u32>, cell_offset: u32) {
  let cell_x = f32(cell_xy.x / u.width);
  let cell_y = f32(cell_xy.y / u.height);
  let cell_position = vec2(cell_x, cell_y);

  let metadata_count = u32(regional_environment_topology[3u]);
  let metadata_offset = 4u;
  let node_count = u32(regional_environment_topology[3u + metadata_count]);

  for (var node_index: u32 = 0; node_index < node_count; node_index++) {
    let region_x = regional_environment_topology[metadata_offset + node_index * metadata_count + 1u];
    let region_y = regional_environment_topology[metadata_offset + node_index * metadata_count + 2u];
    let region_r = regional_environment_topology[metadata_offset + node_index * metadata_count + 3u];

    let cell_distance = distance(cell_position, vec2(region_x, region_y));

    if (cell_distance > region_r) {
      continue;
    }

    let region_distance_weight = region_r - cell_distance / region_r;

    let node_offset = u32(regional_environment_topology[metadata_offset + metadata_count + node_index * 2u]);
    let edges_count = u32(regional_environment_topology[node_offset]);

    for (var edge_index: u32 = 0; edge_index < edges_count; edge_index++) {
      let genotype_cell_index = u32(regional_environment_topology[node_offset + edge_index * 2u]);
      let genotype_influence_weight = regional_environment_topology[node_offset + edge_index * 2u + 1u];

      environment_shifts[cell_offset + genotype_cell_index] =
        environment_shifts[cell_offset + genotype_cell_index] +
          u.regional_environment_gain * genotype_influence_weight * region_distance_weight;
    }
  }
}

fn apply_global_environment_shifts(cell_offset: u32) {
  let node_offset = u32(global_environment_topology[4u]);
  let edges_count = u32(global_environment_topology[5u]);

  for (var edge_index: u32 = 0; edge_index < edges_count; edge_index++) {
    let genotype_cell_index = u32(global_environment_topology[node_offset + edge_index * 2u]);
    let genotype_influence_weight = global_environment_topology[node_offset + edge_index * 2u + 1u];

    environment_shifts[cell_offset + genotype_cell_index] =
      environment_shifts[cell_offset + genotype_cell_index] +
        u.global_environment_gain * genotype_influence_weight;
  }
}
