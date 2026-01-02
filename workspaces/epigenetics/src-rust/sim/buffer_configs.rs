use crate::sim;

pub struct BufferConfigs {
  configs: Vec<sim::buffer::Config>,
}

impl BufferConfigs {
  pub fn from_config(config: &sim::Config, width: u32, height: u32) -> Self {
    let sim::Config {
      genotype_size,
      phenotype_size,
      epistasis_edges_min,
      epistasis_edges_max,
      phenotype_edges_min,
      phenotype_edges_max,
      regional_env_count,
      regional_env_epi_edges_min,
      regional_env_epi_edges_max,
      regional_env_fit_edges_min,
      regional_env_fit_edges_max,
      global_env_epi_edges_min,
      global_env_epi_edges_max,
      global_env_fit_edges_min,
      global_env_fit_edges_max,
      partnership_fitness_edges_min,
      partnership_fitness_edges_max,
      partnership_monogamy_edges_min,
      partnership_monogamy_edges_max,
      ..
    } = *config;

    let cell_count = config.get_cell_count(width, height);
    let regional_environment_metadata =
      Self::generate_regional_environment_metadata(regional_env_count);

    BufferConfigs {
      configs: vec![
        // 1.compute_environment_shifts
        sim::buffer::TopologiesConfig {
          label: "regional_env_epi_topology",
          topologies: vec![sim::buffer::TopologyConfig {
            node_count: regional_env_count,
            metadata: Some(regional_environment_metadata.clone()),
            edges_index_pool_size: genotype_size,
            edges_index_min: regional_env_epi_edges_min,
            edges_index_max: regional_env_epi_edges_max,
            weight_type: sim::buffer::WeightType::RandomShift,
          }],
        }
        .into(),
        sim::buffer::TopologiesConfig {
          label: "global_env_epi_topology",
          topologies: vec![sim::buffer::TopologyConfig {
            node_count: 1,
            metadata: None,
            edges_index_pool_size: genotype_size,
            edges_index_min: global_env_epi_edges_min,
            edges_index_max: global_env_epi_edges_max,
            weight_type: sim::buffer::WeightType::RandomShift,
          }],
        }
        .into(),
        sim::buffer::WeightsConfig {
          label: "genotype_weights_shifts",
          ping_pong: false,
          count: cell_count,
          weight_count: genotype_size,
          weight_type: sim::buffer::WeightType::Blank,
        }
        .into(),
        // 2.compute_epistasis_shifts
        sim::buffer::WeightsConfig {
          label: "genotype_weights",
          ping_pong: true,
          count: cell_count,
          weight_count: genotype_size,
          weight_type: sim::buffer::WeightType::Random,
        }
        .into(),
        sim::buffer::TopologiesConfig {
          label: "genotype_epistasis_topology",
          topologies: vec![sim::buffer::TopologyConfig {
            node_count: genotype_size,
            metadata: None,
            edges_index_pool_size: genotype_size,
            edges_index_min: epistasis_edges_min,
            edges_index_max: epistasis_edges_max,
            weight_type: sim::buffer::WeightType::RandomShift,
          }],
        }
        .into(),
        // 3.compute_phenotype_shifts
        sim::buffer::TopologiesConfig {
          label: "phenotype_topology",
          topologies: vec![sim::buffer::TopologyConfig {
            node_count: phenotype_size,
            metadata: None,
            edges_index_pool_size: genotype_size,
            edges_index_min: phenotype_edges_min,
            edges_index_max: phenotype_edges_max,
            weight_type: sim::buffer::WeightType::Random,
          }],
        }
        .into(),
        sim::buffer::WeightsConfig {
          label: "phenotype_weights",
          ping_pong: false,
          count: cell_count,
          weight_count: phenotype_size,
          weight_type: sim::buffer::WeightType::Blank,
        }
        .into(),
        // 4.compute_fitness_scores
        sim::buffer::TopologiesConfig {
          label: "regional_env_fit_topology",
          topologies: vec![sim::buffer::TopologyConfig {
            node_count: regional_env_count,
            metadata: Some(regional_environment_metadata.clone()),
            edges_index_pool_size: phenotype_size,
            edges_index_min: regional_env_fit_edges_min,
            edges_index_max: regional_env_fit_edges_max,
            weight_type: sim::buffer::WeightType::Random,
          }],
        }
        .into(),
        sim::buffer::TopologiesConfig {
          label: "global_env_fit_topology",
          topologies: vec![sim::buffer::TopologyConfig {
            node_count: 1,
            metadata: None,
            edges_index_pool_size: phenotype_size,
            edges_index_min: global_env_fit_edges_min,
            edges_index_max: global_env_fit_edges_max,
            weight_type: sim::buffer::WeightType::Random,
          }],
        }
        .into(),
        sim::buffer::WeightsConfig {
          label: "fitness_scores",
          ping_pong: false,
          count: cell_count,
          weight_count: regional_env_count + 1,
          weight_type: sim::buffer::WeightType::Fixed(1.0),
        }
        .into(),
        // 5.compute_partnerships
        sim::buffer::TopologiesConfig {
          label: "partnership_topology",
          topologies: vec![
            sim::buffer::TopologyConfig {
              node_count: 1,
              metadata: None,
              edges_index_pool_size: phenotype_size,
              edges_index_min: partnership_fitness_edges_min,
              edges_index_max: partnership_fitness_edges_max,
              weight_type: sim::buffer::WeightType::RandomContribution,
            },
            sim::buffer::TopologyConfig {
              node_count: 1,
              metadata: None,
              edges_index_pool_size: phenotype_size,
              edges_index_min: partnership_monogamy_edges_min,
              edges_index_max: partnership_monogamy_edges_max,
              weight_type: sim::buffer::WeightType::RandomContribution,
            },
          ],
        }
        .into(),
        sim::buffer::WeightsConfig {
          label: "partnership_selection_weights",
          ping_pong: false,
          count: cell_count,
          weight_count: 2,
          weight_type: sim::buffer::WeightType::Blank,
        }
        .into(),
        sim::buffer::WeightsConfig {
          label: "partnership_indexes",
          ping_pong: false,
          count: cell_count,
          weight_count: 1,
          weight_type: sim::buffer::WeightType::Fixed(-1.0),
        }
        .into(),
      ],
    }
  }

  pub fn generate_regional_environment_metadata(regional_env_count: u32) -> Vec<f32> {
    let angle_increment = (std::f32::consts::PI * 2.0) / regional_env_count as f32;
    let angle_offset = std::f32::consts::PI / 2.0;

    let mut positions = (0..regional_env_count)
      .map(|i| {
        (
          (angle_increment * (i as f32) + angle_offset).cos(),
          (angle_increment * (i as f32) + angle_offset).sin(),
        )
      })
      // Convert -1..1 to 0..1
      .map(|(x, y)| ((x + 1.0) / 2.0, (y + 1.0) / 2.0))
      .collect::<Vec<(f32, f32)>>();

    fastrand::shuffle(&mut positions);

    // We calculate the radii based on the distance between all of the positions.
    // The radius of each environment should overlap the next environment by 25%
    // of the half the distance between the two environments.
    let radii = (0..regional_env_count as usize)
      .map(|i| {
        let (x1, y1) = positions[i];

        let mut radius = 0.0;

        for j in 0..regional_env_count as usize {
          if i == j {
            continue;
          }

          let (x2, y2) = positions[j];
          let d = ((x1 - x2).powf(2.0) + (y1 - y2).powf(2.0)).sqrt();
          let r = d * 0.5;

          if r > radius {
            radius = r;
          }
        }

        radius
      })
      .collect::<Vec<f32>>();

    let colors = sim::utils::get_random_colors(regional_env_count as usize);

    (0..regional_env_count as usize)
      .flat_map(|i| {
        [
          positions[i].0,
          positions[i].1,
          radii[i],
          colors[i].0,
          colors[i].1,
          colors[i].2,
        ]
      })
      .collect::<Vec<f32>>()
  }
}

impl IntoIterator for BufferConfigs {
  type Item = sim::buffer::Config;
  type IntoIter = std::vec::IntoIter<sim::buffer::Config>;

  fn into_iter(self) -> Self::IntoIter {
    self.configs.into_iter()
  }
}
