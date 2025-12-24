use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use crate::sim::{self, utils};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[typeshare]
pub struct Config {
  pub cell_size: u32,
  pub genotype_size: u32,
  pub phenotype_size: u32,
  pub epistasis_enabled: bool,
  pub epistasis_gain: f32,
  pub epistasis_edges_min: f32,
  pub epistasis_edges_max: f32,
  pub phenotype_gain: f32,
  pub phenotype_edges_min: f32,
  pub phenotype_edges_max: f32,
  pub regional_env_enabled: bool,
  pub regional_env_count: u32,
  pub regional_env_overlap: f32,
  pub regional_env_epi_gain: f32,
  pub regional_env_epi_edges_min: f32,
  pub regional_env_epi_edges_max: f32,
  pub regional_env_fit_gain: f32,
  pub regional_env_fit_edges_min: f32,
  pub regional_env_fit_edges_max: f32,
  pub global_env_enabled: bool,
  pub global_env_epi_gain: f32,
  pub global_env_epi_edges_min: f32,
  pub global_env_epi_edges_max: f32,
  pub global_env_fit_gain: f32,
  pub global_env_fit_edges_min: f32,
  pub global_env_fit_edges_max: f32,
  pub reproduction_search_radius: u32,
}

impl Config {
  /// Calculate the number of cells based on pixel dimensions and cell size
  pub fn get_cell_count(&self, width: u32, height: u32) -> u32 {
    (width / self.cell_size) * (height / self.cell_size)
  }

  pub fn create() -> Self {
    Self {
      cell_size: 20,
      genotype_size: 25,
      epistasis_enabled: true,
      epistasis_gain: 1.0,
      epistasis_edges_min: 0.0,
      epistasis_edges_max: 1.0,
      phenotype_gain: 1.0,
      phenotype_size: 50,
      phenotype_edges_min: 0.0,
      phenotype_edges_max: 1.0,
      regional_env_enabled: true,
      regional_env_epi_gain: 1.0,
      regional_env_count: 3,
      regional_env_overlap: 0.5,
      regional_env_epi_edges_min: 0.35,
      regional_env_epi_edges_max: 0.60,
      regional_env_fit_gain: 1.0,
      regional_env_fit_edges_min: 0.35,
      regional_env_fit_edges_max: 0.60,
      global_env_enabled: true,
      global_env_epi_gain: 1.0,
      global_env_epi_edges_min: 0.50,
      global_env_epi_edges_max: 0.75,
      global_env_fit_gain: 1.0,
      global_env_fit_edges_min: 0.50,
      global_env_fit_edges_max: 0.75,
      reproduction_search_radius: 4,
    }
  }
}

pub struct BufferConfigs {
  configs: Vec<sim::buffer::Config>,
}

impl BufferConfigs {
  pub fn from_config(config: &Config, width: u32, height: u32) -> Self {
    let Config {
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
            weight_min: -1.0,
            weight_max: 1.0,
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
            weight_min: -1.0,
            weight_max: 1.0,
          }],
        }
        .into(),
        sim::buffer::WeightsConfig {
          label: "genotype_weights_shifts",
          ping_pong: false,
          count: cell_count,
          weight_count: genotype_size,
          weight_min: 0.0,
          weight_max: 0.0,
        }
        .into(),
        // 2.compute_epistasis_shifts
        sim::buffer::WeightsConfig {
          label: "genotype_weights",
          ping_pong: false,
          count: cell_count,
          weight_count: genotype_size,
          weight_min: 0.0,
          weight_max: 1.0,
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
            weight_min: -1.0,
            weight_max: 1.0,
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
            weight_min: 0.0,
            weight_max: 1.0,
          }],
        }
        .into(),
        sim::buffer::WeightsConfig {
          label: "phenotype_weights",
          ping_pong: false,
          count: cell_count,
          weight_count: phenotype_size,
          weight_min: 0.0,
          weight_max: 0.0,
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
            weight_min: 0.0,
            weight_max: 1.0,
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
            weight_min: 0.0,
            weight_max: 1.0,
          }],
        }
        .into(),
        sim::buffer::WeightsConfig {
          label: "fitness_scores",
          ping_pong: false,
          count: cell_count,
          weight_count: regional_env_count + 1,
          weight_min: 0.0,
          weight_max: 0.0,
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

    let colors = utils::get_random_colors(regional_env_count as usize);

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

#[repr(C)]
#[derive(Copy, Clone, Debug, bytemuck::Pod, bytemuck::Zeroable)]
pub struct Uniforms {
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

#[derive(Clone)]
pub struct Data {
  pub buffers: Vec<sim::Buffer>,
  pub buffers_index: HashMap<&'static str, usize>,
  pub uniforms: Uniforms,
}

impl Data {
  pub fn memory_usage_estimated(config: &Config, width: u32, height: u32) -> u64 {
    BufferConfigs::from_config(config, width, height)
      .configs
      .iter()
      .map(|config| config.memory_usage_max())
      .sum()
  }

  pub fn create(device: &wgpu::Device, config: &Config, width: u32, height: u32) -> Self {
    let buffers = BufferConfigs::from_config(config, width, height)
      .configs
      .iter()
      .map(|config| sim::Buffer::from_config(device, config.clone()))
      .collect::<Vec<_>>();

    let buffers_index: HashMap<&'static str, usize> = buffers
      .iter()
      .enumerate()
      .map(|(index, buffer)| (buffer.label, index))
      .collect();

    let uniforms = Uniforms {
      width,
      height,
      cell_size: config.cell_size,
      cell_count: config.get_cell_count(width, height),
      genotype_size: config.genotype_size,
      phenotype_size: config.phenotype_size,
      epistasis_gain: config.epistasis_gain,
      phenotype_gain: config.phenotype_gain,
      regional_env_count: config.regional_env_count,
      regional_env_overlap: config.regional_env_overlap,
      regional_env_epi_gain: config.regional_env_epi_gain,
      global_env_epi_gain: config.global_env_epi_gain,
    };

    Self {
      buffers,
      buffers_index,
      uniforms,
    }
  }

  pub fn get_buffer(&self, label: &'static str) -> &sim::Buffer {
    if let Some(index) = self.buffers_index.get(label) {
      &self.buffers[*index]
    } else {
      panic!("Buffer not found: {}", label);
    }
  }

  pub fn memory_usage_actual(&self) -> u64 {
    self
      .buffers
      .iter()
      .map(|buffer| buffer.memory_usage())
      .sum()
  }

  pub fn swap(&mut self) {
    self.buffers.iter_mut().for_each(|buffer| buffer.swap());
  }
}
