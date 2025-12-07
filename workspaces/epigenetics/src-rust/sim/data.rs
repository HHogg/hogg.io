use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use crate::sim;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[typeshare]
pub struct Config {
  pub cell_size: u32,
  pub genotype_size: u32,
  pub phenotype_size: u32,
  pub epistasis_gain: f32,
  pub epistasis_edges_min: f32,
  pub epistasis_edges_max: f32,
  pub phenotype_gain: f32,
  pub phenotype_edges_min: f32,
  pub phenotype_edges_max: f32,
  pub local_environment_gain: f32,
  pub local_environment_effect_radius: u32,
  pub local_environment_edges_min: f32,
  pub local_environment_edges_max: f32,
  pub regional_environment_gain: f32,
  pub regional_environment_count: u32,
  pub regional_environment_edges_min: f32,
  pub regional_environment_edges_max: f32,
  pub global_environment_gain: f32,
  pub global_environment_edges_min: f32,
  pub global_environment_edges_max: f32,
  pub reproduction_search_radius: u32,
}

impl Config {
  /// Calculate the number of cells based on pixel dimensions and cell size
  pub fn get_cell_count(&self, width: u32, height: u32) -> u32 {
    (width / self.cell_size) * (height / self.cell_size)
  }

  pub fn create() -> Self {
    Self {
      cell_size: 5,
      genotype_size: 50,
      epistasis_gain: 0.05,
      epistasis_edges_min: 0.0,
      epistasis_edges_max: 0.15,
      phenotype_gain: 0.05,
      phenotype_size: 50,
      phenotype_edges_min: 0.0,
      phenotype_edges_max: 0.15,
      local_environment_gain: 0.02,
      local_environment_effect_radius: 1,
      local_environment_edges_min: 0.20,
      local_environment_edges_max: 0.45,
      regional_environment_gain: 0.01,
      regional_environment_count: 3,
      regional_environment_edges_min: 0.35,
      regional_environment_edges_max: 0.60,
      global_environment_gain: 0.005,
      global_environment_edges_min: 0.50,
      global_environment_edges_max: 0.75,
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
      regional_environment_count,
      regional_environment_edges_min,
      regional_environment_edges_max,
      global_environment_edges_min,
      global_environment_edges_max,
      ..
    } = *config;

    let cell_count = config.get_cell_count(width, height);

    BufferConfigs {
      configs: vec![
        // 1.compute_environment_shifts
        sim::buffer::TopologiesConfig {
          label: "regional_environment_topology",
          topologies: vec![sim::buffer::TopologyConfig {
            node_count: regional_environment_count,
            metadata: Some(Self::generate_regional_environment_metadata(
              regional_environment_count,
            )),
            edges_index_pool_size: genotype_size,
            edges_index_min: regional_environment_edges_min,
            edges_index_max: regional_environment_edges_max,
            weight_min: -1.0,
            weight_max: 1.0,
          }],
        }
        .into(),
        sim::buffer::TopologiesConfig {
          label: "global_environment_topology",
          topologies: vec![sim::buffer::TopologyConfig {
            node_count: 1,
            metadata: None,
            edges_index_pool_size: genotype_size,
            edges_index_min: global_environment_edges_min,
            edges_index_max: global_environment_edges_max,
            weight_min: -1.0,
            weight_max: 1.0,
          }],
        }
        .into(),
        sim::buffer::WeightsConfig {
          label: "environment_shifts",
          ping_pong: false,
          count: cell_count,
          weight_count: genotype_size,
          weight_min: 0.0,
          weight_max: 1.0,
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
            weight_min: -1.0,
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
        sim::buffer::WeightsConfig {
          label: "fitness_scores",
          ping_pong: false,
          count: cell_count,
          weight_count: 1,
          weight_min: 0.0,
          weight_max: 0.0,
        }
        .into(),
      ],
    }
  }

  pub fn generate_regional_environment_metadata(regional_environment_count: u32) -> Vec<f32> {
    let angle_increment = (std::f32::consts::PI * 2.0) / regional_environment_count as f32;
    let angle_offset = std::f32::consts::PI / 2.0;

    let mut metadata = (0..regional_environment_count)
      .flat_map(|i| {
        [
          (angle_increment * (i as f32) + angle_offset).cos(), // TODO: Pass in from UI
          (angle_increment * (i as f32) + angle_offset).sin(), // TODO: Pass in from UI
          0.0,
        ]
      })
      .collect::<Vec<f32>>();

    for i in 0..regional_environment_count as usize {
      let x1 = metadata[i * 3];
      let y1 = metadata[i * 3 + 1];

      for j in i + 1..regional_environment_count as usize {
        let x2 = metadata[j * 3];
        let y2 = metadata[j * 3 + 1];

        let distance = ((x1 - x2).powf(2.0) + (y1 - y2).powf(2.0)).sqrt();

        metadata[i * 3 + 2] = distance;
        metadata[j * 3 + 2] = distance;
      }
    }

    metadata
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
  local_environment_gain: f32,
  local_environment_effect_radius: u32,
  regional_environment_gain: f32,
  global_environment_gain: f32,
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
      local_environment_gain: config.local_environment_gain,
      local_environment_effect_radius: config.local_environment_effect_radius,
      regional_environment_gain: config.regional_environment_gain,
      global_environment_gain: config.global_environment_gain,
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
