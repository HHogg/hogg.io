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
@group(0) @binding(2) var<storage, read> genotype_epistasis_topology: array<f32>;
@group(0) @binding(3) var<storage, read_write> genotype_weights_shifts: array<f32>;

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

/**
 * Using the epistasis topology, apply an epistasis effect where the genotype
 * weights of the hypostatic genes are adjusted based on the weight of the
 * linked epistatic genes.
 */
@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let cell_xy = global_id.xy;
  let cell_index = get_cell_index_for_xy(cell_xy);

  if (is_outside_cell_grid(cell_xy)) {
    return;
  }

  apply_epistasis_topology_effects(cell_index);
}

fn apply_epistasis_topology_effects(cell_index: u32) {
  let genotype_cell_offset = cell_index * u.genotype_size;
  let node_offset = u32(genotype_epistasis_topology[5u + genotype_cell_offset]);
  let edges_count = u32(genotype_epistasis_topology[node_offset]);
  let edge_offset = node_offset + 1u;

  for (var epistatic_index: u32 = 0; epistatic_index < u.genotype_size; epistatic_index++) {
    let epistatic_weight = genotype_weights[genotype_cell_offset + epistatic_index];

    for (var edge_index: u32 = 0; edge_index < edges_count; edge_index++) {
      let edge_index_offset = edge_offset + edge_index * 2u;
      let hypostatic_cell_index = u32(genotype_epistasis_topology[edge_index_offset]);
      let epistasis_effect_weight = genotype_epistasis_topology[edge_index_offset + 1u];
      let hypostatic_weight = genotype_weights[genotype_cell_offset + hypostatic_cell_index];

      let epistasis_shift = u.epistasis_gain * epistasis_effect_weight * epistatic_weight * hypostatic_weight;

      genotype_weights_shifts[genotype_cell_offset + hypostatic_cell_index] += epistasis_shift;
    }
  }
}
