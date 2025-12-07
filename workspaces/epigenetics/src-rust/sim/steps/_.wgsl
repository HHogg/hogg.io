
fn apply_local_environment_shifts(cell_xy: vec2<u32>, cell_offset: u32) {
  // let cell_width = u.width / u.cell_size;
  // let cell_height = u.height / u.cell_size;
  // let cell_x = i32(cell_xy.x);
  // let cell_y = i32(cell_xy.y);
  // let neighbor_grid_size = 2u * u.local_environment_effect_radius + 1u;
  // let neighbor_total = neighbor_grid_size * neighbor_grid_size;

  // for (var neighbor_index: u32 = 0; neighbor_index < neighbor_total; neighbor_index++) {
  //   // Convert linear offset to 2D coordinates within the search grid
  //   let x_offset = i32(neighbor_index % neighbor_grid_size) - i32(u.local_environment_effect_radius);
  //   let y_offset = i32(neighbor_index / neighbor_grid_size) - i32(u.local_environment_effect_radius);

  //   // Calculate neighbor cell coordinates
  //   var neighbor_x = cell_x + x_offset;
  //   var neighbor_y = cell_y + y_offset;

  //   // If the neighbor is out of bounds, wrap it around the edges of the cell grid
  //   if (neighbor_x < 0) {
  //     neighbor_x = i32(cell_width) - 1;
  //   } else if (neighbor_x >= i32(cell_width)) {
  //     neighbor_x = 0;
  //   }
  //   if (neighbor_y < 0) {
  //     neighbor_y = i32(cell_height) - 1;
  //   } else if (neighbor_y >= i32(cell_height)) {
  //     neighbor_y = 0;
  //   }

  //   let neighbor_distance = distance(
  //     vec2(f32(cell_x), f32(cell_y)),
  //     vec2(f32(neighbor_x), f32(neighbor_y))
  //   );

  //   let neighbor_cell_index = get_cell_index_for_xy(vec2<u32>(u32(neighbor_x), u32(neighbor_y)));
  //   let neighbor_cell_offset = get_cell_offset_for_cell_index(neighbor_cell_index);
  //   let neighbor_weight = pow(0.5, neighbor_distance);

  //   let neighbor_node_offset = u32(local_environment_topology[4u + neighbor_cell_index]);
  //   let neighbor_edges_count = u32(local_environment_topology[neighbor_node_offset]);

  //   for (var edge_index: u32 = 0; edge_index < neighbor_edges_count; edge_index++) {
  //     let genotype_cell_index = u32(local_environment_topology[neighbor_node_offset + edge_index * 2u]);
  //     let genotype_influence_weight = local_environment_topology[neighbor_node_offset + edge_index * 2u + 1u];

  //     environment_shifts[cell_offset + genotype_cell_index] =
  //       environment_shifts[cell_offset + genotype_cell_index] +
  //         u.local_environment_gain * genotype_influence_weight * neighbor_weight;
  //   }
  // }
}



// fn sigmoid(x: f32) -> f32 {
//   if (x >= 0.0) {
//       let z = exp(-x);
//       return 1.0 / (1.0 + z);
//   } else {
//       let z = exp(x);
//       return z / (1.0 + z);
//   }
// }

// fn logit(x: f32) -> f32 {
//   let eps = 1e-6;
//   let v = clamp(x, eps, 1.0 - eps);
//   return log(v / (1.0 - v));
// }

// fn get_shifted_weight(gain: f32, weight_base: f32, weight_shift: f32, weight_interaction: f32) -> f32 {
//   let z = logit(weight_base);
//   let delta = gain * weight_interaction * weight_shift;
//   return  sigmoid(z + delta);
// }

// // Computing phenotype weights for a single cell.
// //
// fn compute_phenotype_weights(genotype_offset: u32, phenotype_offset: u32) {
//   apply_epistasis_topology_effects(genotype_offset);
//   apply_baseline_phenotype_weights(genotype_offset, phenotype_offset);
//   apply_baseline_phenotype_effects(genotype_offset, phenotype_offset);
//   apply_global_environment_topology_effects(genotype_offset, phenotype_offset);
//   apply_regional_environment_topology_effects(genotype_offset, phenotype_offset);
//   apply_local_environment_topology_effects(genotype_offset, phenotype_offset);
// }

// // Using the epistasis topology, apply an epistasis effect where the genotype
// // weights of the hypostatic genes are adjusted based on the weight of the
// // linked epistatic genes.
// fn apply_epistasis_topology_effects(genotype_offset: u32) {
//   var topology_index = 0u;

//   for (var epistatic_index: u32 = 0; epistatic_index < u.genotype_size; epistatic_index++) {
//     let hypostatic_count = u32(epistasis_topology[topology_index]);
//     let epistatic_weight = genotype_weights_read[genotype_offset + epistatic_index];
//     var sum_delta = 0.0;

//     // Move to the first topology index element
//     topology_index = topology_index + 1u;

//     for (var hypostatic_index: u32 = 0; hypostatic_index < hypostatic_count; hypostatic_index++) {
//       let hypostatic_cell_index = u32(epistasis_topology[topology_index + 1u]);
//       let hypostatic_effect_weight = epistasis_topology[topology_index + 2u];
//       let hypostatic_weight = genotype_weights_read[hypostatic_cell_index];

//       sum_delta = sum_delta + (u.phenotype_gain * hypostatic_effect_weight * hypostatic_weight);

//       // Move to the next topology index element
//       topology_index = topology_index + 2u;
//     }

//     // Apply sigmoid once using base_weight and sum of deltas
//     genotype_weights_read[genotype_offset + epistatic_index] = sigmoid(logit(epistatic_weight) + sum_delta);
//   }
// }

// // Using the phenotype topology, create a baseline weight for each phenotype based on
// // the average weight of the linked genotypes.
// fn apply_baseline_phenotype_weights(genotype_offset: u32, phenotype_offset: u32) {
//   var topology_index = 0u;

//   for (var phenotype_index: u32 = 0; phenotype_index < u.phenotype_size; phenotype_index++) {
//     let genotype_count = u32(phenotype_topology[topology_index]);
//     var genotype_weight_sum = 0.0;

//     // Move to the first topology index element
//     topology_index = topology_index + 1u;

//     if (genotype_count > 0u) {
//       for (var genotype_index: u32 = 0; genotype_index < genotype_count; genotype_index++) {
//         let genotype_cell_index = u32(phenotype_topology[topology_index]);
//         let genotype_weight = genotype_weights_read[genotype_offset + genotype_cell_index];

//         // Accumulate Δ = gain * interaction * weight
//         genotype_weight_sum = genotype_weight_sum + genotype_weight;

//         // Move to the next topology index element (skipping the weight)
//         topology_index = topology_index + 2u;
//       }

//       phenotype_weights[phenotype_offset + phenotype_index] = genotype_weight_sum / f32(genotype_count);
//     }
//   }
// }

// // Using the phenotype topology, apply a phenotype effect where the phenotype weight
// // is adjusted based on the weights of the linked phenotype topology effect weights.
// fn apply_baseline_phenotype_effects(genotype_offset: u32, phenotype_offset: u32) {
//   var topology_index = 0u;

//   for (var phenotype_index: u32 = 0; phenotype_index < u.phenotype_size; phenotype_index++) {
//     let genotype_count = u32(phenotype_topology[topology_index]);
//     let phenotype_weight = phenotype_weights[phenotype_offset + phenotype_index];
//     var sum_delta = 0.0;

//     // Move to the first topology index element
//     topology_index = topology_index + 1u;

//     for (var genotype_index: u32 = 0; genotype_index < genotype_count; genotype_index++) {
//       let genotype_cell_index = u32(phenotype_topology[topology_index + 1u]);
//       let genotype_effect_weight = phenotype_topology[topology_index + 2u];
//       let genotype_weight = genotype_weights_read[genotype_offset + genotype_cell_index];

//       // Accumulate Δ = gain * interaction * weight
//       sum_delta = sum_delta + (u.phenotype_gain * genotype_effect_weight * genotype_weight);

//       // Move to the next topology index element
//       topology_index = topology_index + 2u;
//     }

//     phenotype_weights[phenotype_offset + phenotype_index] = sigmoid(logit(phenotype_weight) + sum_delta);
//   }
// }

// // Using the global environment topology [0], apply a global environment effect where the phenotype weight
// // is adjusted based on the weights of the linked environmental weights.
// fn apply_global_environment_topology_effects(genotype_offset: u32, phenotype_offset: u32) {
//   var topology_index = 0u;

//   for (var phenotype_index: u32 = 0; phenotype_index < u.phenotype_size; phenotype_index++) {
//     let genotype_count = u32(global_environment_topology[topology_index]);
//     let phenotype_weight = phenotype_weights[phenotype_offset + phenotype_index];
//     var sum_delta = 0.0;

//     // Move to the first topology index element
//     topology_index = topology_index + 1u;

//     for (var genotype_index: u32 = 0; genotype_index < genotype_count; genotype_index++) {
//       let genotype_cell_index = u32(global_environment_topology[topology_index + 1u]);
//       let genotype_effect_weight = global_environment_topology[topology_index + 2u];
//       let genotype_weight = genotype_weights_read[genotype_offset + genotype_cell_index];

//       // Accumulate Δ = gain * interaction * weight
//       sum_delta = sum_delta + (u.global_environment_gain * genotype_effect_weight * genotype_weight);

//       // Move to the next topology index element
//       topology_index = topology_index + 2u;
//     }

//     phenotype_weights[phenotype_offset + phenotype_index] = sigmoid(logit(phenotype_weight) + sum_delta);
//   }
// }

// // Using the global environment topology [1..regional_environment_count], apply regional environment
// // effect where the phenotype weight is adjusted based on the weights of the linked environmental weights.
// fn apply_regional_environment_topology_effects(genotype_offset: u32, phenotype_offset: u32) {
//   // The regional topology exists within the same topology buffer, so we need to skip over it.
//   var topology_index = u32(global_environment_topology[0]) * 2u + 1u;

//   for (var regional_environment_index: u32 = 0; regional_environment_index < u.regional_environment_count; regional_environment_index++) {
//     for (var phenotype_index: u32 = 0; phenotype_index < u.phenotype_size; phenotype_index++) {
//       let genotype_count = u32(global_environment_topology[topology_index]);
//       let phenotype_weight = phenotype_weights[phenotype_offset + phenotype_index];
//       var sum_delta = 0.0;

//       // Move to the first topology index element
//       topology_index = topology_index + 1u;

//       for (var genotype_index: u32 = 0; genotype_index < genotype_count; genotype_index++) {
//         let genotype_cell_index = u32(global_environment_topology[topology_index + 1u]);
//         let genotype_effect_weight = global_environment_topology[topology_index + 2u];
//         let genotype_weight = genotype_weights_read[genotype_offset + genotype_cell_index];

//         // Accumulate Δ = gain * interaction * weight
//         sum_delta = sum_delta + (u.regional_environment_gain * genotype_effect_weight * genotype_weight);

//         // Move to the next topology index element
//         topology_index = topology_index + 2u;
//       }

//       phenotype_weights[phenotype_offset + phenotype_index] = sigmoid(logit(phenotype_weight) + sum_delta);
//     }
//   }
// }

// // Using the local environment topology of this cell and the surrounding cells (less weighted)
// // apply a local environment effect where the phenotype weight is adjusted based on the weights
// // of the linked environmental weights.
// fn apply_local_environment_topology_effects(genotype_offset: u32, phenotype_offset: u32) {
//   // var topology_index = 0u;

//   // for (var phenotype_index: u32 = 0; phenotype_index < u.phenotype_size; phenotype_index++) {
//   //   let genotype_count = u32(local_environment_topology[topology_index]);
//   //   let phenotype_weight = phenotype_weights[phenotype_offset + phenotype_index];
//   //   var sum_delta = 0.0;

//   //   // Move to the first topology index element
//   //   topology_index = topology_index + 1u;

//   //   for (var genotype_index: u32 = 0; genotype_index < genotype_count; genotype_index++) {
//   //     let genotype_cell_index = u32(local_environment_topology[topology_index + 1u]);
//   //     let genotype_effect_weight = local_environment_topology[topology_index + 2u];
//   //     let genotype_weight = genotype_weights_read[genotype_offset + genotype_cell_index];

//   //     // Accumulate Δ = gain * interaction * weight
//   //     sum_delta = sum_delta + (u.local_environment_gain * genotype_effect_weight * genotype_weight);

//   //     // Move to the next topology index element
//   //     topology_index = topology_index + 2u;
//   //   }

//   //   phenotype_weights[phenotype_offset + phenotype_index] = sigmoid(logit(phenotype_weight) + sum_delta);
//   // }
// }

  // global_id.xy is in cell coordinates, not pixel coordinates
  // let cell_xy = global_id.xy;
  // let cell_width = u.width / u.cell_size;
  // let cell_index = cell_xy.x + cell_xy.y * cell_width;
  // let genotype_offset = cell_index * u.genotype_size;
  // let phenotype_offset = cell_index * u.phenotype_size;

  // compute_phenotype_weights(genotype_offset, phenotype_offset);



// @group(0) @binding(1) var<storage, read_write> genotype_weights_read: array<f32>; // 0..1
// @group(0) @binding(2) var<storage, read> epistasis_topology: array<f32>; // -1..1
// @group(0) @binding(3) var<storage, read_write> phenotype_weights: array<f32>; // 0..1
// @group(0) @binding(4) var<storage, read> phenotype_topology: array<f32>; // -1..1
// @group(0) @binding(5) var<storage, read> local_environment_topology: array<f32>; // -1..1
// @group(0) @binding(6) var<storage, read> global_environment_topology: array<f32>; // -1..1



// fn get_cell_index_for_xy(cell_xy: vec2<u32>) -> u32 {
//   let cell_width = u.width / u.cell_size;
//   return cell_xy.x + cell_xy.y * cell_width;
// }

// fn get_genotype_offset_for_cell_index(cell_index: u32) -> u32 {
//   return cell_index * u.genotype_size;
// }

// fn get_phenotype_offset_for_cell_index(cell_index: u32) -> u32 {
//   return cell_index * u.phenotype_size;
// }

// fn get_fitness_score(cell_index: u32, phenotype_offset: u32) -> f32 {
//   var total = 0.0;
//   for (var i: u32 = 0; i < u.phenotype_size; i++) {
//     total = total + phenotype_weights[phenotype_offset + i];
//   }
//   return total / f32(u.phenotype_size);
// }

// fn compute_next_generation(cell_xy: vec2<u32>, genotype_offset: u32, phenotype_offset: u32) {
//   compute_next_generation_genotype_weights(cell_xy, genotype_offset, phenotype_offset);
//   apply_genotype_mutations(genotype_offset, phenotype_offset);
//   apply_developmental_reprogramming_effects(genotype_offset, phenotype_offset);
// }


// fn compute_next_generation_genotype_weights(cell_xy: vec2<u32>, genotype_offset: u32, phenotype_offset: u32) {
//   let reproduction_partner_cell_index = find_reproduction_partner_cell_index(cell_xy, genotype_offset, phenotype_offset);
//   let reproduction_partner_genotype_offset = get_genotype_offset_for_cell_index(reproduction_partner_cell_index);

//   // Generate new genotype by randomly selecting from each parent for each gene
//   // This mimics crossover in sexual reproduction
//   for (var gene_index: u32 = 0; gene_index < u.genotype_size; gene_index++) {
//     // Use a hash function to generate pseudo-random selection per gene
//     // This gives deterministic randomness (reproducible) but varies per gene
//     let random_bit = hash_for_crossover(genotype_offset, gene_index);

//     if (random_bit == 0u) {
//       // Take from current cell (parent 1)
//       genotype_weights_write[genotype_offset + gene_index] = genotype_weights_read[genotype_offset + gene_index];
//     } else {
//       // Take from reproduction partner (parent 2)
//       genotype_weights_write[genotype_offset + gene_index] = genotype_weights_read[reproduction_partner_genotype_offset + gene_index];
//     }
//   }
// }

// // Simple hash function to generate pseudo-random 0 or 1 for crossover selection
// // Uses cell index and gene index to ensure different randomness per gene
// fn hash_for_crossover(genotype_offset: u32, gene_index: u32) -> u32 {
//   // Combine offsets and gene index, then hash
//   let combined = genotype_offset + gene_index;
//   // Simple hash: multiply by large prime, add gene index, then mod 2
//   return (combined * 1103515245u + gene_index * 12345u) % 2u;
// }

// fn find_reproduction_partner_cell_index(cell_xy: vec2<u32>, genotype_offset: u32, phenotype_offset: u32) -> u32 {
//   let cell_index = get_cell_index_for_xy(cell_xy);
//   let fitness_score = get_fitness_score(cell_index, phenotype_offset);
//   var closest_fitness_score_delta = 999999.0; // Start with large value so first comparison works
//   var closest_fitness_score_cell_index = 0u;

//   let cell_x = i32(cell_xy.x);
//   let cell_y = i32(cell_xy.y);
//   let grid_size = 2u * u.reproduction_search_radius + 1u;
//   let total_cells = grid_size * grid_size;

//   for (var cell_offset: u32 = 0; cell_offset < total_cells; cell_offset++) {
//     // Convert linear offset to 2D coordinates within the search grid
//     let x_offset = i32(cell_offset % grid_size) - i32(u.reproduction_search_radius);
//     let y_offset = i32(cell_offset / grid_size) - i32(u.reproduction_search_radius);

//     // Calculate neighbor cell coordinates
//     var neighbor_x = cell_x + x_offset;
//     var neighbor_y = cell_y + y_offset;

//     // Skip self
//     if (neighbor_x == cell_x && neighbor_y == cell_y) {
//       continue;
//     }

//     // If the neighbor is out of bounds, wrap it around the edges of the cell grid
//     let cell_width = u.width / u.cell_size;
//     let cell_height = u.height / u.cell_size;
//     if (neighbor_x < 0) {
//       neighbor_x = i32(cell_width) - 1;
//     }
//     if (neighbor_x >= i32(cell_width)) {
//       neighbor_x = 0;
//     }
//     if (neighbor_y < 0) {
//       neighbor_y = i32(cell_height) - 1;
//     }
//     if (neighbor_y >= i32(cell_height)) {
//       neighbor_y = 0;
//     }

//     let neighbor_cell_index = get_cell_index_for_xy(vec2<u32>(u32(neighbor_x), u32(neighbor_y)));
//     let neighbor_phenotype_offset = get_phenotype_offset_for_cell_index(neighbor_cell_index);
//     let neighbor_fitness_score = get_fitness_score(neighbor_cell_index, neighbor_phenotype_offset);
//     let fitness_score_delta = abs(fitness_score - neighbor_fitness_score);

//     if (fitness_score_delta < closest_fitness_score_delta) {
//       closest_fitness_score_delta = fitness_score_delta;
//       closest_fitness_score_cell_index = neighbor_cell_index;
//     }
//   }

//   return closest_fitness_score_cell_index;
// }

// fn apply_genotype_mutations(genotype_offset: u32, phenotype_offset: u32) {
//   // TODO
// }

// fn apply_developmental_reprogramming_effects(genotype_offset: u32, phenotype_offset: u32) {
//   // TODO
// }
