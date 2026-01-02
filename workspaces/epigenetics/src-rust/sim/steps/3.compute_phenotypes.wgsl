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
@group(0) @binding(1) var<storage, read> genotype_weights: array<f32>;
@group(0) @binding(2) var<storage, read> genotype_weights_shifts: array<f32>;
@group(0) @binding(3) var<storage, read> phenotype_topology: array<f32>;
@group(0) @binding(4) var<storage, read_write> phenotype_weights: array<f32>;


@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  if (is_outside_cell_grid(global_id.xy)) {
    return;
  }

  let cell_xy = global_id.xy;
  let cell_index = get_cell_index_for_xy(cell_xy);

  compute_phenotype_weights(cell_index);
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

fn compute_phenotype_weights(cell_index: u32) {
  let genotype_cell_offset = cell_index * u.genotype_size;
  let phenotype_cell_offset = cell_index * u.phenotype_size;

  // Topology parsing (CSR)
  // We currently generate exactly 1 topology for this buffer.
  let topology_offset = u32(phenotype_topology[1u]);
  let metadata_count = u32(phenotype_topology[topology_offset]);
  let metadata_offset = topology_offset + 1u;
  let node_count = u32(phenotype_topology[metadata_offset + metadata_count]);
  let node_offsets_offset = metadata_offset + metadata_count + 1u;

  for (var phenotype_index: u32 = 0; phenotype_index < u.phenotype_size; phenotype_index++) {
    // Get the node offset for this phenotype node
    let node_offset = u32(phenotype_topology[node_offsets_offset + phenotype_index]);
    let edges_count = u32(phenotype_topology[node_offset]);
    let edge_offset = node_offset + 1u;

    var phenotype_base_weight: f32 = 0.0;
    var phenotype_weight_shift: f32 = 0.0;

    for (var edge_index: u32 = 0; edge_index < edges_count; edge_index++) {
      let edge_index_offset = edge_offset + edge_index * 2u;
      let genotype_index = u32(phenotype_topology[edge_index_offset]);
      let edge_weight = phenotype_topology[edge_index_offset + 1u];

      let genotype_weight = genotype_weights[genotype_cell_offset + genotype_index];
      let genotype_shift = genotype_weights_shifts[genotype_cell_offset + genotype_index];

      phenotype_base_weight = (phenotype_base_weight + genotype_weight) * 0.5;
      phenotype_weight_shift += genotype_shift * edge_weight;
    }

    var phenotype_weight = phenotype_base_weight;

    if (phenotype_weight_shift != 0.0) {
      phenotype_weight = sigmoid(logit(phenotype_base_weight) + phenotype_weight_shift);
    }

    phenotype_weights[phenotype_cell_offset + phenotype_index] = phenotype_weight;
  }
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
