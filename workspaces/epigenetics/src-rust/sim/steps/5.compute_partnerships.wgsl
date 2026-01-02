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
@group(0) @binding(1) var<storage, read> phenotype_weights: array<f32>;
@group(0) @binding(2) var<storage, read> fitness_scores: array<f32>;
@group(0) @binding(3) var<storage, read> partnership_topology: array<f32>;
@group(0) @binding(4) var<storage, read_write> partnership_selection_weights: array<f32>;
@group(0) @binding(5) var<storage, read_write> partnership_indexes: array<f32>;

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  if (is_outside_cell_grid(global_id.xy)) {
    return;
  }

  let cell_xy = global_id.xy;
  let cell_index = get_cell_index_for_xy(cell_xy);
  let cell_fitness = get_cell_fitness(cell_index);
  let cell_fitness_acceptance = get_cell_fitness_acceptance(cell_index);
  let cell_monogamous_weight = get_cell_monogamous_weight(cell_index);

  // Store the fitness and monogamous weights for this cell
  partnership_selection_weights[cell_index * 2u] = cell_fitness_acceptance;
  partnership_selection_weights[cell_index * 2u + 1u] = cell_monogamous_weight;

  let cell_seed = vec2<f32>(f32(cell_index), cell_fitness);

  let partnership_opportunity_count = get_random_u32_between(cell_seed, 0, u.partnership_opportunities_max);

  var current_partner_index = -1.0;
  var current_partner_fitness_delta = 0.0;

  for (var i: u32 = 0; i < partnership_opportunity_count; i++) {
    let partner_seed = cell_seed + vec2<f32>(f32(i), f32(i));
    let partner_index = get_random_u32_between(partner_seed, 0, u.cell_count);

    if (partner_index == cell_index) {
      continue;
    }

    let partner_fitness = get_cell_fitness(partner_index);
    let fitness_delta = abs(partner_fitness - cell_fitness);

    if (fitness_delta > cell_fitness_acceptance) {
      continue;
    }

    if (current_partner_index == -1.0) {
      current_partner_index = f32(partner_index);
      current_partner_fitness_delta = fitness_delta;
    } else {
      let switch_seed = cell_seed + vec2<f32>(current_partner_index, current_partner_fitness_delta);
      let switch_chance = get_random_f32_between(switch_seed, 0.0, 1.0);

      if (switch_chance > cell_monogamous_weight) {
        current_partner_index = f32(partner_index);
        current_partner_fitness_delta = fitness_delta;
      }
    }
  }

  if (current_partner_index != -1.0) {
    partnership_indexes[cell_index] = current_partner_index;
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

fn get_cell_fitness(cell_index: u32) -> f32 {
  let fitness_stride = u.regional_env_count + 1u;
  let fitness_offset = cell_index * fitness_stride;

  // Sum all fitness scores for this cell
  var total_fitness: f32 = 0.0;
  for (var i: u32 = 0u; i < fitness_stride; i++) {
    total_fitness += fitness_scores[fitness_offset + i];
  }

  return total_fitness / 4.0;
}

fn get_cell_fitness_acceptance(cell_index: u32) -> f32 {
  let phenotype_cell_offset = cell_index * u.phenotype_size;

  let topology_offset = u32(partnership_topology[1u]);
  let node_offset = u32(partnership_topology[topology_offset + 2u]);
  let edges_count = u32(partnership_topology[node_offset]);
  let edge_offset = node_offset + 1u;

  var fitness_acceptance = 0.0;

  for (var edge_index: u32 = 0; edge_index < edges_count; edge_index++) {
    let edge_index_offset = edge_offset + edge_index * 2u;
    let phenotype_cell_index = u32(partnership_topology[edge_index_offset]);
    let phenotype_contribution_weight = partnership_topology[edge_index_offset + 1u];

    let phenotype_weight = phenotype_weights[phenotype_cell_offset + phenotype_cell_index];
    let phenotype_contribution = phenotype_weight * phenotype_contribution_weight;

    fitness_acceptance += phenotype_contribution;
  }

  // When amplification = 1: result = 1
  // When amplification = -1: result = 0
  // When amplification = 0: result = fitness_acceptance (unchanged)
  if (u.partnership_fitness_amplification >= 0.0) {
    return fitness_acceptance + (1.0 - fitness_acceptance) * u.partnership_fitness_amplification;
  } else {
    return fitness_acceptance - fitness_acceptance * -(u.partnership_fitness_amplification);
  }
}

fn get_cell_monogamous_weight(cell_index: u32) -> f32 {
  let phenotype_cell_offset = cell_index * u.phenotype_size;

  let topology_offset = u32(partnership_topology[2u]);
  let node_offset = u32(partnership_topology[topology_offset + 2u]);
  let edges_count = u32(partnership_topology[node_offset]);
  let edge_offset = node_offset + 1u;

  var monogamous_weight = 0.0;

  for (var edge_index: u32 = 0; edge_index < edges_count; edge_index++) {
    let edge_index_offset = edge_offset + edge_index * 2u;
    let phenotype_cell_index = u32(partnership_topology[edge_index_offset]);
    let phenotype_contribution_weight = partnership_topology[edge_index_offset + 1u];

    let phenotype_weight = phenotype_weights[phenotype_cell_offset + phenotype_cell_index];
    let phenotype_contribution = phenotype_weight * phenotype_contribution_weight;

    monogamous_weight += phenotype_contribution;
  }

  // When amplification = 1: result = 1
  // When amplification = -1: result = 0
  // When amplification = 0: result = monogamous_weight (unchanged)
  if (u.partnership_monogamy_amplification >= 0.0) {
    return monogamous_weight + (1.0 - monogamous_weight) * u.partnership_monogamy_amplification;
  } else {
    return monogamous_weight - monogamous_weight * -(u.partnership_monogamy_amplification);
  }
}

fn rand(seed: vec2<f32>) -> f32 {
  let dot_val = dot(seed, vec2<f32>(12.9898, 78.233));
  return fract(sin(dot_val) * 43758.5453);
}

fn get_random_f32_between(seed: vec2<f32>, a: f32, b: f32) -> f32 {
  return a + (b - a) * rand(seed);
}

fn get_random_u32_between(seed: vec2<f32>, a: u32, b: u32) -> u32 {
  return u32(floor(get_random_f32_between(seed, f32(a), f32(b))));
}
