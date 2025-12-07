use wasm_bindgen::JsValue;

use crate::sim;
use crate::utils::create_shader_module;

const COMPUTE_SHADER_TEMPLATE: &str = include_str!("./compute.wgsl");

#[repr(C)]
#[derive(Copy, Clone, Debug, bytemuck::Pod, bytemuck::Zeroable)]
struct Uniforms {
  width: u32,
  height: u32,
  cell_size: u32,
  cell_count: u32,
  genotype_size: u32,
  phenotype_size: u32,
  epistasis_gain: f32,
  phenotype_gain: f32,
  local_environment_gain: f32,
  regional_environment_count: u32,
  regional_environment_gain: f32,
  global_environment_gain: f32,
}

// Generate shader source with specified workgroup size
fn generate_shader_source(workgroup_size_x: u32, workgroup_size_y: u32) -> String {
  COMPUTE_SHADER_TEMPLATE.replace(
    "@compute @workgroup_size(8, 8, 1)",
    &format!("@compute @workgroup_size({workgroup_size_x}, {workgroup_size_y}, 1)"),
  )
}

pub struct ComputePhenotypes {
  pub pipeline: wgpu::ComputePipeline,
  pub bind_group_layout: wgpu::BindGroupLayout,
  pub uniform_buffer: wgpu::Buffer,
}

impl sim::Step for ComputePhenotypes {
  fn create(state: &sim::step::CreateState) -> Result<Self, JsValue> {
    let sim::step::CreateState {
      device,
      queue,
      width,
      surface_config,
      workgroup_size_x,
      workgroup_size_y,
      data_config,
      ..
    } = state;
    let height = surface_config.height;

    // Generate shader source with optimal workgroup size
    let shader_source = generate_shader_source(*workgroup_size_x, *workgroup_size_y);
    let compute_shader = create_shader_module(device, &shader_source);

    // Create uniform buffer for uniforms struct
    let uniform_buffer = device.create_buffer(&wgpu::BufferDescriptor {
      label: Some("uniforms"),
      size: std::mem::size_of::<Uniforms>() as u64,
      usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
      mapped_at_creation: false,
    });

    // Initialize uniform buffer
    let cell_count = data_config.get_cell_count(*width, height);
    let uniforms = Uniforms {
      width: *width,
      height,
      cell_size: data_config.cell_size,
      cell_count,
      genotype_size: data_config.genotype_size,
      phenotype_size: data_config.phenotype_size,
      epistasis_gain: data_config.epistasis_gain,
      phenotype_gain: data_config.phenotype_gain,
      local_environment_gain: data_config.local_environment_gain,
      regional_environment_count: data_config.regional_environment_count,
      regional_environment_gain: data_config.regional_environment_gain,
      global_environment_gain: data_config.global_environment_gain,
    };

    queue.write_buffer(&uniform_buffer, 0, bytemuck::cast_slice(&[uniforms]));

    // Create bind group layout
    // All simulation data buffers are storage buffers
    let bind_group_layout = device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
      label: None,
      entries: &[
        // uniforms struct
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
        // genotype_weights_read storage buffer
        wgpu::BindGroupLayoutEntry {
          binding: 1,
          count: None,
          visibility: wgpu::ShaderStages::COMPUTE,
          ty: wgpu::BindingType::Buffer {
            ty: wgpu::BufferBindingType::Storage { read_only: false },
            has_dynamic_offset: false,
            min_binding_size: None,
          },
        },
        // epistasis_topology storage buffer (read)
        wgpu::BindGroupLayoutEntry {
          binding: 2,
          count: None,
          visibility: wgpu::ShaderStages::COMPUTE,
          ty: wgpu::BindingType::Buffer {
            ty: wgpu::BufferBindingType::Storage { read_only: true },
            has_dynamic_offset: false,
            min_binding_size: None,
          },
        },
        // phenotype_weights storage buffer (read_write)
        wgpu::BindGroupLayoutEntry {
          binding: 3,
          count: None,
          visibility: wgpu::ShaderStages::COMPUTE,
          ty: wgpu::BindingType::Buffer {
            ty: wgpu::BufferBindingType::Storage { read_only: false },
            has_dynamic_offset: false,
            min_binding_size: None,
          },
        },
        // phenotype_topology storage buffer (read)
        wgpu::BindGroupLayoutEntry {
          binding: 4,
          count: None,
          visibility: wgpu::ShaderStages::COMPUTE,
          ty: wgpu::BindingType::Buffer {
            ty: wgpu::BufferBindingType::Storage { read_only: true },
            has_dynamic_offset: false,
            min_binding_size: None,
          },
        },
        // local_environment_topology storage buffer (read)
        wgpu::BindGroupLayoutEntry {
          binding: 5,
          count: None,
          visibility: wgpu::ShaderStages::COMPUTE,
          ty: wgpu::BindingType::Buffer {
            ty: wgpu::BufferBindingType::Storage { read_only: true },
            has_dynamic_offset: false,
            min_binding_size: None,
          },
        },
        // global_environment_topology storage buffer (read)
        wgpu::BindGroupLayoutEntry {
          binding: 6,
          count: None,
          visibility: wgpu::ShaderStages::COMPUTE,
          ty: wgpu::BindingType::Buffer {
            ty: wgpu::BufferBindingType::Storage { read_only: true },
            has_dynamic_offset: false,
            min_binding_size: None,
          },
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

    Ok(Self {
      pipeline,
      bind_group_layout,
      uniform_buffer,
    })
  }

  fn run(&mut self, state: &mut sim::step::RunState) -> Result<(), JsValue> {
    let sim::step::RunState {
      device,
      queue,
      width,
      height,
      data,
      data_config,
      ..
    } = state;

    // Update uniform buffer
    let cell_count = data_config.get_cell_count(*width, *height);
    let uniforms = Uniforms {
      width: *width,
      height: *height,
      cell_size: data_config.cell_size,
      cell_count,
      genotype_size: data_config.genotype_size,
      phenotype_size: data_config.phenotype_size,
      epistasis_gain: data_config.epistasis_gain,
      phenotype_gain: data_config.phenotype_gain,
      local_environment_gain: data_config.local_environment_gain,
      regional_environment_count: data_config.regional_environment_count,
      regional_environment_gain: data_config.regional_environment_gain,
      global_environment_gain: data_config.global_environment_gain,
    };
    queue.write_buffer(&self.uniform_buffer, 0, bytemuck::cast_slice(&[uniforms]));

    let resources = vec![
      self.uniform_buffer.as_entire_binding(),
      data.genotype_weights.read_binding(),
      data.epistasis_topology.read_binding(),
      data.phenotype_weights.write_binding(),
      data.phenotype_topology.read_binding(),
      data.local_environment_topology.read_binding(),
      data.global_environment_topology.read_binding(),
    ];

    // Create bind group with all simulation data buffers
    // These buffers are loaded once at startup and reused every frame (no transfer overhead)
    let bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
      label: None,
      layout: &self.bind_group_layout,
      entries: &resources
        .iter()
        .enumerate()
        .map(|(i, resource)| wgpu::BindGroupEntry {
          binding: i as u32,
          resource: resource.clone(),
        })
        .collect::<Vec<_>>(),
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

      // Dispatch workgroups based on cells, not pixels
      // Each cell is cell_size x cell_size pixels
      let cell_width = (*width).div_ceil(data_config.cell_size);
      let cell_height = (*height).div_ceil(data_config.cell_size);
      let workgroup_count_x = cell_width.div_ceil(state.workgroup_size_x);
      let workgroup_count_y = cell_height.div_ceil(state.workgroup_size_y);
      let workgroup_count_z = 1;

      compute_pass.dispatch_workgroups(workgroup_count_x, workgroup_count_y, workgroup_count_z);
    }

    // Submit command buffer
    queue.submit(std::iter::once(encoder.finish()));

    Ok(())
  }
}
