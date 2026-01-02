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

/**
 * Topology data structure:
 * [
 *  TopologyCount,
 *  TopologyOffsets,
 *  Topology[
 *    MetadataCount,
 *    Metadata,
 *    NodeCount,
 *    NodeOffsets,
 *    Nodes[
 *      EdgesCount,
 *      Edges[
 *        EdgeIndex,
 *        EdgeWeight
 *      ]
 *    ]
 *  ]
 * ]
 */

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read> regional_env_epi_topology: array<f32>;
@group(0) @binding(2) var<storage, read> global_env_epi_topology: array<f32>;
@group(0) @binding(3) var<storage, read_write> genotype_weights_shifts: array<f32>;

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
  if (is_outside_cell_grid(global_id.xy)) {
    return;
  }

  let cell_xy = global_id.xy;
  let cell_index = get_cell_index_for_xy(cell_xy);
  let cell_position = get_cell_position_for_xy(cell_xy);

  if (u.regional_env_enabled == 1u) {
    apply_regional_environment_shifts(cell_index, cell_position);
  }

  if (u.global_env_enabled == 1u) {
    apply_global_environment_shifts(cell_index);
  }
}

fn is_outside_cell_grid(cell_xy: vec2<u32>) -> bool {
  if (u.cell_size == 0u) {
    return true;
  }
  let cell_grid_width = u.width / u.cell_size;
  let cell_grid_height = u.height / u.cell_size;
  return cell_grid_width == 0u
    || cell_grid_height == 0u
    || cell_xy.x >= cell_grid_width
    || cell_xy.y >= cell_grid_height;
}

fn get_cell_index_for_xy(cell_xy: vec2<u32>) -> u32 {
  let cell_grid_width = u.width / u.cell_size;
  return cell_xy.x + cell_xy.y * cell_grid_width;
}

fn get_cell_position_for_xy(cell_xy: vec2<u32>) -> vec2<f32> {
  let cell_grid_width = f32(u.width / u.cell_size);
  let cell_grid_height = f32(u.height / u.cell_size);

  // Return normalized coordinates (0..1) to match regional/global env positions
  return vec2<f32>(
    (f32(cell_xy.x) + 0.5) / cell_grid_width,
    (f32(cell_xy.y) + 0.5) / cell_grid_height,
  );
}

fn apply_regional_environment_shifts(cell_index: u32, cell_position: vec2<f32>) {
  let genotype_cell_offset = cell_index * u.genotype_size;

  // Topology parsing (CSR)
  // We currently generate exactly 1 topology for this buffer.
  let topology_offset = u32(regional_env_epi_topology[1u]);
  let metadata_count = u32(regional_env_epi_topology[topology_offset]);
  let metadata_offset = topology_offset + 1u;
  let node_count = u32(regional_env_epi_topology[metadata_offset + metadata_count]);
  let node_offsets_offset = metadata_offset + metadata_count + 1u;

  // [x, y, r, R, G, B].
  let metadata_stride = metadata_count / node_count;

  for (var node_index: u32 = 0; node_index < node_count; node_index++) {
    let metadata_base = metadata_offset + node_index * metadata_stride;
    let region_x = regional_env_epi_topology[metadata_base];
    let region_y = regional_env_epi_topology[metadata_base + 1u];
    let region_r_inner = regional_env_epi_topology[metadata_base + 2u];
    let region_r = region_r_inner * (1.0 + u.regional_env_overlap);

    let cell_distance = distance(cell_position, vec2(region_x, region_y));

    if (cell_distance > region_r) {
      continue;
    }

    let region_distance_weight = region_r - cell_distance / region_r;

    let node_offset = u32(regional_env_epi_topology[node_offsets_offset + node_index]);
    let edges_count = u32(regional_env_epi_topology[node_offset]);
    let edge_offset = node_offset + 1u;

    for (var edge_index: u32 = 0; edge_index < edges_count; edge_index++) {
      let edge_index_offset = edge_offset + edge_index * 2u;
      let genotype_cell_index = u32(regional_env_epi_topology[edge_index_offset]);
      let genotype_influence_weight = regional_env_epi_topology[edge_index_offset + 1u];

      let environment_shift = u.regional_env_epi_gain * region_distance_weight * genotype_influence_weight;

      genotype_weights_shifts[genotype_cell_offset + genotype_cell_index] += environment_shift;
    }
  }
}

fn apply_global_environment_shifts(cell_index: u32) {
  let genotype_cell_offset = cell_index * u.genotype_size;

  // Topology parsing (CSR)
  // We currently generate exactly 1 topology for this buffer (with 1 node).
  let topology_offset = u32(global_env_epi_topology[1u]);
  let metadata_count = u32(global_env_epi_topology[topology_offset]);
  let metadata_offset = topology_offset + 1u;
  let node_count = u32(global_env_epi_topology[metadata_offset + metadata_count]);
  let node_offsets_offset = metadata_offset + metadata_count + 1u;

  if (node_count == 0u) {
    return;
  }

  let node_offset = u32(global_env_epi_topology[node_offsets_offset]);
  let edges_count = u32(global_env_epi_topology[node_offset]);
  let edge_offset = node_offset + 1u;

  for (var edge_index: u32 = 0; edge_index < edges_count; edge_index++) {
    let edge_index_offset = edge_offset + edge_index * 2u;
    let genotype_cell_index = u32(global_env_epi_topology[edge_index_offset]);
    let genotype_influence_weight = global_env_epi_topology[edge_index_offset + 1u];

    let environment_shift = u.global_env_epi_gain * genotype_influence_weight;

    genotype_weights_shifts[genotype_cell_offset + genotype_cell_index] += environment_shift;
  }
}
