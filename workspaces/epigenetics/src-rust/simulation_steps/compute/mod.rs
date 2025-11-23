use wasm_bindgen::JsValue;
use wgpu::{BindGroupLayout, Buffer, ComputePipeline};

use crate::{
  simulation_program::{SimulationCreateState, SimulationRunState, SimulationStep},
  utils::create_shader_module,
};

const COMPUTE_SHADER_TEMPLATE: &str = include_str!("./wgsl/compute.wgsl");

// Generate shader source with specified workgroup size
fn generate_shader_source(workgroup_size_x: u32, workgroup_size_y: u32) -> String {
  COMPUTE_SHADER_TEMPLATE.replace(
    "@compute @workgroup_size(8, 8, 1)",
    &format!("@compute @workgroup_size({workgroup_size_x}, {workgroup_size_y}, 1)"),
  )
}

pub struct SimulationStepCompute {
  pub pipeline: ComputePipeline,
  pub bind_group_layout: BindGroupLayout,
  pub uniform_pass_index_buffer: Buffer,
  pub uniform_texture_size_buffer: Buffer,
}

impl SimulationStep for SimulationStepCompute {
  fn create(state: &SimulationCreateState) -> Result<Self, JsValue> {
    let SimulationCreateState {
      device,
      workgroup_size_x,
      workgroup_size_y,
      ..
    } = state;

    // Generate shader source with optimal workgroup size
    let shader_source = generate_shader_source(*workgroup_size_x, *workgroup_size_y);
    let compute_shader = create_shader_module(device, &shader_source);

    // Create uniform buffers
    let uniform_pass_index_buffer = device.create_buffer(&wgpu::BufferDescriptor {
      label: Some("uniform_pass_index_buffer"),
      size: std::mem::size_of::<u32>() as u64,
      usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
      mapped_at_creation: false,
    });

    let uniform_texture_size_buffer = device.create_buffer(&wgpu::BufferDescriptor {
      label: Some("uniform_texture_size_buffer"),
      size: (std::mem::size_of::<u32>() * 3) as u64,
      usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
      mapped_at_creation: false,
    });

    // Create bind group layout
    let bind_group_layout = device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
      label: None,
      entries: &[
        // u_pass_index uniform buffer
        wgpu::BindGroupLayoutEntry {
          binding: 0,
          visibility: wgpu::ShaderStages::COMPUTE,
          ty: wgpu::BindingType::Buffer {
            ty: wgpu::BufferBindingType::Uniform,
            has_dynamic_offset: false,
            min_binding_size: None,
          },
          count: None,
        },
        // u_texture_size uniform buffer
        wgpu::BindGroupLayoutEntry {
          binding: 1,
          visibility: wgpu::ShaderStages::COMPUTE,
          ty: wgpu::BindingType::Buffer {
            ty: wgpu::BufferBindingType::Uniform,
            has_dynamic_offset: false,
            min_binding_size: None,
          },
          count: None,
        },
        // seed_texture (2D texture for per-pixel seeds)
        wgpu::BindGroupLayoutEntry {
          binding: 2,
          visibility: wgpu::ShaderStages::COMPUTE,
          ty: wgpu::BindingType::Texture {
            multisampled: false,
            view_dimension: wgpu::TextureViewDimension::D2,
            sample_type: wgpu::TextureSampleType::Float { filterable: false },
          },
          count: None,
        },
        // read_texture (3D storage texture for reading previous frame)
        wgpu::BindGroupLayoutEntry {
          binding: 3,
          visibility: wgpu::ShaderStages::COMPUTE,
          ty: wgpu::BindingType::StorageTexture {
            access: wgpu::StorageTextureAccess::ReadOnly,
            format: wgpu::TextureFormat::R32Float,
            view_dimension: wgpu::TextureViewDimension::D3,
          },
          count: None,
        },
        // write_texture (3D storage texture for writing new frame)
        wgpu::BindGroupLayoutEntry {
          binding: 4,
          visibility: wgpu::ShaderStages::COMPUTE,
          ty: wgpu::BindingType::StorageTexture {
            access: wgpu::StorageTextureAccess::WriteOnly,
            format: wgpu::TextureFormat::R32Float,
            view_dimension: wgpu::TextureViewDimension::D3,
          },
          count: None,
        },
      ],
    });

    // Create compute pipeline
    let pipeline_layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
      label: None,
      bind_group_layouts: &[&bind_group_layout],
      push_constant_ranges: &[],
    });

    let pipeline = device.create_compute_pipeline(&wgpu::ComputePipelineDescriptor {
      label: None,
      layout: Some(&pipeline_layout),
      module: &compute_shader,
      entry_point: Some("main"),
      compilation_options: Default::default(),
      cache: None,
    });

    Ok(SimulationStepCompute {
      pipeline,
      bind_group_layout,
      uniform_pass_index_buffer,
      uniform_texture_size_buffer,
    })
  }

  fn run(&self, state: &mut SimulationRunState) -> Result<(), JsValue> {
    let SimulationRunState {
      device,
      queue,
      width,
      height,
      depth,
      pass_index,
      read_texture_view,
      write_texture_view,
      seed_texture_view,
      ..
    } = state;

    // Update uniform buffers
    let pass_index_value: u32 = *pass_index;
    queue.write_buffer(
      &self.uniform_pass_index_buffer,
      0,
      bytemuck::cast_slice(&[pass_index_value]),
    );

    let texture_size_values: [u32; 3] = [*width, *height, *depth];
    queue.write_buffer(
      &self.uniform_texture_size_buffer,
      0,
      bytemuck::cast_slice(&texture_size_values),
    );

    let bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
      label: None,
      layout: &self.bind_group_layout,
      entries: &[
        wgpu::BindGroupEntry {
          binding: 0,
          resource: self.uniform_pass_index_buffer.as_entire_binding(),
        },
        wgpu::BindGroupEntry {
          binding: 1,
          resource: self.uniform_texture_size_buffer.as_entire_binding(),
        },
        wgpu::BindGroupEntry {
          binding: 2,
          resource: wgpu::BindingResource::TextureView(seed_texture_view),
        },
        wgpu::BindGroupEntry {
          binding: 3,
          resource: wgpu::BindingResource::TextureView(read_texture_view),
        },
        wgpu::BindGroupEntry {
          binding: 4,
          resource: wgpu::BindingResource::TextureView(write_texture_view),
        },
      ],
    });

    let mut encoder =
      device.create_command_encoder(&wgpu::CommandEncoderDescriptor { label: None });

    {
      let mut compute_pass = encoder.begin_compute_pass(&wgpu::ComputePassDescriptor {
        label: None,
        timestamp_writes: None,
      });

      // Set pipeline and bind group
      compute_pass.set_pipeline(&self.pipeline);
      compute_pass.set_bind_group(0, &bind_group, &[]);

      // Dispatch workgroups using the configured workgroup size
      let workgroup_count_x = (*width).div_ceil(state.workgroup_size_x);
      let workgroup_count_y = (*height).div_ceil(state.workgroup_size_y);
      let workgroup_count_z = *depth; // Process one z layer per workgroup

      compute_pass.dispatch_workgroups(workgroup_count_x, workgroup_count_y, workgroup_count_z);
    }

    // Submit command buffer
    queue.submit(std::iter::once(encoder.finish()));

    Ok(())
  }
}
