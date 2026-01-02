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
@group(0) @binding(1) var<storage, read> regional_env_fit_topology: array<f32>;
@group(0) @binding(2) var<storage, read> global_env_fit_topology: array<f32>;
@group(0) @binding(3) var<storage, read> phenotype_weights: array<f32>;
@group(0) @binding(4) var<storage, read_write> fitness_scores: array<f32>;

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  if (is_outside_cell_grid(global_id.xy)) {
    return;
  }

  let cell_xy = global_id.xy;
  let cell_index = get_cell_index_for_xy(cell_xy);
  let cell_position = get_cell_position_for_xy(cell_xy);

  if (u.regional_env_enabled == 1u) {
    calculate_regional_environment_fitness_scores(cell_index, cell_position);
  }

  if (u.global_env_enabled == 1u) {
    calculate_global_environment_fitness_scores(cell_index);
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

fn calculate_regional_environment_fitness_scores(cell_index: u32, cell_position: vec2<f32>) {
  let phenotype_offset = cell_index * u.phenotype_size;

  // Topology parsing (CSR)
  // We currently generate exactly 1 topology for this buffer.
  let topology_offset = u32(regional_env_fit_topology[1u]);
  let metadata_count = u32(regional_env_fit_topology[topology_offset]);
  let metadata_offset = topology_offset + 1u;
  let node_count = u32(regional_env_fit_topology[metadata_offset + metadata_count]);
  let node_offsets_offset = metadata_offset + metadata_count + 1u;

  // [x, y, r, R, G, B].
  var fitness_score_average = -1.0;
  let metadata_stride = metadata_count / node_count;

  for (var node_index: u32 = 0; node_index < node_count; node_index++) {
    let metadata_base = metadata_offset + node_index * metadata_stride;
    let region_x = regional_env_fit_topology[metadata_base];
    let region_y = regional_env_fit_topology[metadata_base + 1u];
    let region_r_inner = regional_env_fit_topology[metadata_base + 2u];
    let region_r = region_r_inner * (1.0 + u.regional_env_overlap);

    let cell_distance = distance(cell_position, vec2(region_x, region_y));

    if (cell_distance > region_r) {
      continue;
    }

    let node_offset = u32(regional_env_fit_topology[node_offsets_offset + node_index]);
    let edges_count = u32(regional_env_fit_topology[node_offset]);
    let edge_offset = node_offset + 1u;

    var score = 0.0;

    for (var edge_index: u32 = 0; edge_index < edges_count; edge_index++) {
      let edge_index_offset = edge_offset + edge_index * 2u;
      let phenotype_cell_index = u32(regional_env_fit_topology[edge_index_offset]);
      let phenotype_fit_weight = regional_env_fit_topology[edge_index_offset + 1u];
      let phenotype_weight = phenotype_weights[phenotype_offset + phenotype_cell_index];
      let phenotype_fit_score = 1 - abs(phenotype_fit_weight - phenotype_weight);

      score += phenotype_fit_score;
    }

    score = score / f32(edges_count);

    let fitness_stride = node_count + 1u;
    let fitness_offset = cell_index * fitness_stride;

    fitness_scores[fitness_offset + node_index] = score;

    if (fitness_score_average == -1.0) {
      fitness_score_average = score;
    } else {
      fitness_score_average = (fitness_score_average + score) / 2.0;
    }
  }

  for (var node_index: u32 = 0; node_index < node_count; node_index++) {
    let metadata_base = metadata_offset + node_index * metadata_stride;
    let region_x = regional_env_fit_topology[metadata_base];
    let region_y = regional_env_fit_topology[metadata_base + 1u];
    let region_r_inner = regional_env_fit_topology[metadata_base + 2u];
    let region_r = region_r_inner * (1.0 + u.regional_env_overlap);

    let cell_distance = distance(cell_position, vec2(region_x, region_y));

    if (cell_distance > region_r) {
      let fitness_stride = node_count + 1u;
      let fitness_offset = cell_index * fitness_stride;
      fitness_scores[fitness_offset + node_index] = fitness_score_average;
    }
  }
}

fn calculate_global_environment_fitness_scores(cell_index: u32) {
  let phenotype_offset = cell_index * u.phenotype_size;

  // Topology parsing (CSR)
  // We currently generate exactly 1 topology for this buffer (with 1 node).
  let topology_offset = u32(global_env_fit_topology[1u]);
  let metadata_count = u32(global_env_fit_topology[topology_offset]);
  let metadata_offset = topology_offset + 1u;
  let node_offsets_offset = metadata_offset + metadata_count + 1u;

  let node_offset = u32(global_env_fit_topology[node_offsets_offset]);
  let edges_count = u32(global_env_fit_topology[node_offset]);
  let edge_offset = node_offset + 1u;

  var score = 0.0;

  for (var edge_index: u32 = 0; edge_index < edges_count; edge_index++) {
    let edge_index_offset = edge_offset + edge_index * 2u;
    let phenotype_cell_index = u32(global_env_fit_topology[edge_index_offset]);
    let phenotype_fit_weight = global_env_fit_topology[edge_index_offset + 1u];
    let phenotype_weight = phenotype_weights[phenotype_offset + phenotype_cell_index];
    let phenotype_fit_score = 1 - abs(phenotype_fit_weight - phenotype_weight);

    score += phenotype_fit_score;
  }

  score = score / f32(edges_count);

  let fitness_stride = u.regional_env_count + 1u;
  let fitness_offset = cell_index * fitness_stride;

  fitness_scores[fitness_offset + u.regional_env_count] = score;
}
