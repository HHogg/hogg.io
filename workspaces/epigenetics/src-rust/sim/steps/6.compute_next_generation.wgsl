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
@group(0) @binding(1) var<storage, read> genotype_weights_read: array<f32>;
@group(0) @binding(2) var<storage, read_write> genotype_weights_write: array<f32>;
@group(0) @binding(3) var<storage, read> partnership_indexes: array<f32>;

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  if (is_outside_cell_grid(global_id.xy)) {
    return;
  }

  let cell_xy = global_id.xy;
  var cell_index = get_cell_index_for_xy(cell_xy);
  var cell_seed_offset = 0u;
  var partner_index = partnership_indexes[cell_index];

  // If this cell does not have a partner, then we'll allow another cells
  // next generation to occupy it.
  while (partner_index == -1.0 && cell_seed_offset < u.cell_count) {
    let next_cell_seed = vec2<f32>(f32(cell_index), f32(cell_seed_offset));
    let next_cell_index = get_random_cell_index(next_cell_seed);
    cell_seed_offset += 1;

    if (next_cell_index == cell_index) {
      continue;
    }

    cell_index = next_cell_index;
    partner_index = partnership_indexes[cell_index];
  }

  // if (partner_index == -1.0) {
  //   return;
  // }

  compute_next_generation(cell_index, u32(partner_index));
}

fn compute_next_generation(cell_index: u32, partner_index: u32) {
  for (var i: u32 = 0; i < u.genotype_size; i++) {
    let cell_genotype_weight = genotype_weights_read[cell_index * u.genotype_size + i];
    let partner_genotype_weight = genotype_weights_read[partner_index * u.genotype_size + i];
    let next_genotype_weight = (cell_genotype_weight + partner_genotype_weight) / 2.0;
    genotype_weights_write[cell_index * u.genotype_size + i] = next_genotype_weight;
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

fn rand(seed: vec2<f32>) -> f32 {
  let dot_val = dot(seed, vec2<f32>(12.9898, 78.233));
  return fract(sin(dot_val) * 43758.5453);
}

fn get_random_cell_index(seed: vec2<f32>) -> u32 {
  return u32(floor(rand(seed)));
}
