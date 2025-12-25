use std::collections::HashMap;

use crate::{
  post_message::{DataBufferReadContent, Message},
  sim,
};

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
  pub fn memory_usage_estimated(config: &sim::Config, width: u32, height: u32) -> u64 {
    sim::BufferConfigs::from_config(config, width, height)
      .into_iter()
      .map(|config| config.memory_usage_max())
      .sum()
  }

  pub fn create(device: &wgpu::Device, config: &sim::Config, width: u32, height: u32) -> Self {
    let buffers = sim::BufferConfigs::from_config(config, width, height)
      .into_iter()
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

  pub fn get_buffer(&self, label: &str) -> &sim::Buffer {
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

  #[allow(dead_code)]
  pub fn read_buffer_slice(
    &self,
    device: &wgpu::Device,
    queue: &wgpu::Queue,
    label: &str,
    cell_index: u32,
  ) {
    let buffer = self.get_buffer(label);

    match &buffer.config {
      sim::buffer::Config::Topologies(config) => {
        self.read_buffer_slice_topologies(device, queue, label, cell_index, buffer, config)
      }
      sim::buffer::Config::Weights(config) => {
        self.read_buffer_slice_weights(device, queue, label, cell_index, buffer, config)
      }
    }
  }

  fn read_buffer_slice_topologies(
    &self,
    _device: &wgpu::Device,
    _queue: &wgpu::Queue,
    _label: &str,
    _cell_index: u32,
    _buffer: &sim::Buffer,
    _config: &sim::buffer::TopologiesConfig,
  ) {
    // TODO: Implement topology buffer reading
  }

  fn read_buffer_slice_weights(
    &self,
    device: &wgpu::Device,
    queue: &wgpu::Queue,
    label: &str,
    cell_index: u32,
    buffer: &sim::Buffer,
    config: &sim::buffer::WeightsConfig,
  ) {
    let weight_size = std::mem::size_of::<f32>() as u64;
    let slice_size_bytes = (config.weight_count as u64) * weight_size;
    let offset_bytes = (cell_index as u64) * (config.weight_count as u64) * weight_size;

    // Create a staging buffer to read the weights into
    let staging_buffer = device.create_buffer(&wgpu::BufferDescriptor {
      label: Some(format!("{}_staging_buffer", buffer.label).as_str()),
      size: slice_size_bytes,
      usage: wgpu::BufferUsages::MAP_READ | wgpu::BufferUsages::COPY_DST,
      mapped_at_creation: false,
    });

    // Create a command encoder to copy the weights into the staging buffer
    let mut encoder = device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
      label: Some(format!("{}_copy_command_encoder", buffer.label).as_str()),
    });

    // Copy the weights into the staging buffer
    encoder.copy_buffer_to_buffer(
      &buffer.read,
      offset_bytes,
      &staging_buffer,
      0,
      slice_size_bytes,
    );

    // Submit the command encoder to the queue
    queue.submit(std::iter::once(encoder.finish()));

    // Wait for the command encoder to finish and read the data
    // from the staging buffer
    // Clone the buffer so we can move it into the closure while using the original for the slice
    let staging_buffer_for_closure = staging_buffer.clone();
    let buffer_slice = staging_buffer.slice(..);
    let label_clone = label.to_string();

    buffer_slice.map_async(wgpu::MapMode::Read, move |result| match result {
      Ok(_) => {
        // Create a new slice from the cloned staging_buffer inside the callback
        let data = staging_buffer_for_closure.slice(..).get_mapped_range();
        let result: Vec<f32> = bytemuck::cast_slice(&data).to_vec();
        drop(data);
        staging_buffer_for_closure.unmap();

        Message::DataBufferRead(DataBufferReadContent {
          label: label_clone,
          cell_index,
          data: result,
        })
        .send();
      }
      Err(e) => {
        log::error!("Buffer mapping failed: {:?}", e);
      }
    });
  }
}
