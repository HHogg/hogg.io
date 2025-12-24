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
@group(0) @binding(1) var<storage, read> genotype_weights: array<f32>;
@group(0) @binding(2) var<storage, read> genotype_weights_shifts: array<f32>;
@group(0) @binding(3) var<storage, read> phenotype_topology: array<f32>;
@group(0) @binding(4) var<storage, read_write> phenotype_weights: array<f32>;

fn get_cell_index_for_xy(cell_xy: vec2<u32>) -> u32 {
  let cell_grid_width = u.width / u.cell_size;
  return cell_xy.x + cell_xy.y * cell_grid_width;
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

fn sigmoid(x: f32) -> f32 {
  if (x >= 0.0) {
      // Protect against overflow of exp on large numbers
      let z = exp(-x);
      return 1.0 / (1.0 + z);
  } else {
      let z = exp(x);
      return z / (1.0 + z);
  }
}

fn logit(x: f32) -> f32 {
  let eps = 1e-6;
  let v = clamp(x, eps, 1.0 - eps);
  return log(v / (1.0 - v));
}

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let cell_xy = global_id.xy;
  let cell_index = get_cell_index_for_xy(cell_xy);

  if (is_outside_cell_grid(cell_xy)) {
    return;
  }

  compute_phenotype_weights(cell_index);
}

fn compute_phenotype_weights(cell_index: u32) {
  let genotype_cell_offset = cell_index * u.genotype_size;
  let phenotype_offset = cell_index * u.phenotype_size;
  let node_offset = u32(phenotype_topology[5u + cell_index]);
  let edges_count = u32(phenotype_topology[node_offset]);
  let edge_offset = node_offset + 1u;

  for (var phenotype_index: u32 = 0; phenotype_index < u.phenotype_size; phenotype_index++) {
    for (var edge_index: u32 = 0; edge_index < edges_count; edge_index++) {
      let edge_index_offset = edge_offset + edge_index * 2u;
      let genotype_cell_index = u32(phenotype_topology[edge_index_offset]);
      let genotype_influence_weight = phenotype_topology[edge_index_offset + 1u];
      let genotype_base_weight = genotype_weights[genotype_cell_offset + genotype_cell_index];
      let genotype_shift = genotype_weights_shifts[genotype_cell_offset + genotype_cell_index];

      let phenotype_weight = sigmoid(logit(genotype_base_weight) + genotype_shift);

      phenotype_weights[phenotype_offset + phenotype_index] = phenotype_weight;
    }
  }
}
