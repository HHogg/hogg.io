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
@group(0) @binding(1) var<storage, read_write> genotype_weights_shifts: array<f32>;
@group(0) @binding(2) var<storage, read_write> phenotype_weights: array<f32>;
@group(0) @binding(3) var<storage, read_write> fitness_scores: array<f32>;
@group(0) @binding(4) var<storage, read_write> partnership_selection_weights: array<f32>;
@group(0) @binding(5) var<storage, read_write> partnership_indexes: array<f32>;

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  if (is_outside_cell_grid(global_id.xy)) {
    return;
  }

  let cell_xy = global_id.xy;
  let cell_index = get_cell_index_for_xy(cell_xy);

  reset_genotype_weights_shifts(cell_index);
  reset_phenotype_weights(cell_index);
  reset_fitness_scores(cell_index);
  reset_partnership_selection_weights(cell_index);
  reset_partnership_index(cell_index);
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

fn reset_genotype_weights_shifts(cell_index: u32) {
  let genotype_cell_offset = cell_index * u.genotype_size;
  for (var i: u32 = 0u; i < u.genotype_size; i++) {
    genotype_weights_shifts[genotype_cell_offset + i] = 0.0;
  }
}

fn reset_phenotype_weights(cell_index: u32) {
  let phenotype_cell_offset = cell_index * u.phenotype_size;
  for (var i: u32 = 0u; i < u.phenotype_size; i++) {
    phenotype_weights[phenotype_cell_offset + i] = 0.0;
  }
}

fn reset_fitness_scores(cell_index: u32) {
  let fitness_score_offset = cell_index * (u.regional_env_count + 1);

  for (var i: u32 = 0u; i < u.regional_env_count + 1; i++) {
    fitness_scores[fitness_score_offset + i] = 1.0;
  }
}

fn reset_partnership_selection_weights(cell_index: u32) {
  let partnership_selection_weight_offset = cell_index * 2;
  for (var i: u32 = 0u; i < 2; i++) {
    partnership_selection_weights[partnership_selection_weight_offset + i] = 0.0;
  }
}

fn reset_partnership_index(cell_index: u32) {
  partnership_indexes[cell_index] = -1.0;
}
