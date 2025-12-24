use crate::error::SimulationError;
use crate::sim;
use crate::utils::{create_quad_vertices, create_shader_module};

pub struct CreateOptions<'a> {
  pub device: wgpu::Device,
  pub queue: wgpu::Queue,
  pub surface_config: wgpu::SurfaceConfiguration,
  pub workgroup_size_x: u32,
  pub workgroup_size_y: u32,
  pub data: &'a sim::Data,
}

pub struct RunOptions<'a> {
  pub device: wgpu::Device,
  pub queue: wgpu::Queue,
  pub width: u32,
  pub height: u32,
  pub data: &'a sim::Data,
  pub data_config: &'a sim::data::Config,
  pub surface_view: &'a wgpu::TextureView,
  pub workgroup_size_x: u32,
  pub workgroup_size_y: u32,
}

pub enum Step {
  Compute(ComputeStep),
  Render(RenderStep),
}

impl Step {
  pub fn run(
    &mut self,
    encoder: &mut wgpu::CommandEncoder,
    options: &sim::step::RunOptions,
  ) -> Result<(), SimulationError> {
    match self {
      Step::Compute(step) => step.run(encoder, options),
      Step::Render(step) => step.run(encoder, options),
    }
  }
}

impl Into<Step> for ComputeStep {
  fn into(self) -> Step {
    Step::Compute(self)
  }
}
impl Into<Step> for RenderStep {
  fn into(self) -> Step {
    Step::Render(self)
  }
}

pub struct ComputeStep {
  config: ComputeConfig,
  bind_group_layout: wgpu::BindGroupLayout,
  pipeline: wgpu::ComputePipeline,
  uniform_buffer: wgpu::Buffer,
}

pub struct ComputeConfig {
  pub label: &'static str,
  pub compute_shader: &'static str,
  pub buffers: Vec<BufferConfig>,
}

pub struct BufferConfig {
  pub label: &'static str,
  pub read_only: bool,
}

impl ComputeStep {
  pub fn create(
    options: &sim::step::CreateOptions,
    config: ComputeConfig,
  ) -> Result<Self, SimulationError> {
    let sim::step::CreateOptions {
      device,
      queue,
      workgroup_size_x,
      workgroup_size_y,
      data,
      ..
    } = options;

    let shader = create_shader_module(
      device,
      &config.compute_shader.replace(
        "@compute @workgroup_size(8, 8, 1)",
        &format!("@compute @workgroup_size({workgroup_size_x}, {workgroup_size_y}, 1)"),
      ),
    );

    // Create uniform buffer for uniforms struct
    let uniform_buffer = device.create_buffer(&wgpu::BufferDescriptor {
      label: Some("uniforms"),
      size: std::mem::size_of::<sim::data::Uniforms>() as u64,
      usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
      mapped_at_creation: false,
    });

    queue.write_buffer(&uniform_buffer, 0, bytemuck::cast_slice(&[data.uniforms]));

    let mut buffer_entries = config
      .buffers
      .iter()
      .enumerate()
      .map(|(i, buffer)| wgpu::BindGroupLayoutEntry {
        binding: i as u32 + 1,
        count: None,
        visibility: wgpu::ShaderStages::COMPUTE,
        ty: wgpu::BindingType::Buffer {
          has_dynamic_offset: false,
          min_binding_size: None,
          ty: wgpu::BufferBindingType::Storage {
            read_only: buffer.read_only,
          },
        },
      })
      .collect::<Vec<_>>();

    buffer_entries.insert(
      0,
      wgpu::BindGroupLayoutEntry {
        binding: 0,
        count: None,
        visibility: wgpu::ShaderStages::COMPUTE,
        ty: wgpu::BindingType::Buffer {
          has_dynamic_offset: false,
          min_binding_size: None,
          ty: wgpu::BufferBindingType::Uniform,
        },
      },
    );

    let bind_group_layout = device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
      label: None,
      entries: &buffer_entries.as_slice(),
    });

    let pipeline_layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
      label: None,
      bind_group_layouts: &[&bind_group_layout],
      push_constant_ranges: &[],
    });

    let pipeline = device.create_compute_pipeline(&wgpu::ComputePipelineDescriptor {
      label: None,
      layout: Some(&pipeline_layout),
      module: &shader,
      entry_point: Some("main"),
      compilation_options: Default::default(),
      cache: None,
    });

    Ok(Self {
      config,
      pipeline,
      bind_group_layout,
      uniform_buffer,
    })
  }

  pub fn run(
    &mut self,
    encoder: &mut wgpu::CommandEncoder,
    options: &sim::step::RunOptions,
  ) -> Result<(), SimulationError> {
    let sim::step::RunOptions {
      device,
      width,
      height,
      data_config,
      workgroup_size_x,
      workgroup_size_y,
      ..
    } = options;

    let mut bind_group_entries = self
      .config
      .buffers
      .iter()
      .enumerate()
      .map(|(i, buffer)| wgpu::BindGroupEntry {
        binding: i as u32 + 1,
        resource: if buffer.read_only {
          options.data.get_buffer(buffer.label).read_binding()
        } else {
          options.data.get_buffer(buffer.label).write_binding()
        },
      })
      .collect::<Vec<_>>();

    bind_group_entries.insert(
      0,
      wgpu::BindGroupEntry {
        binding: 0,
        resource: self.uniform_buffer.as_entire_binding(),
      },
    );

    let bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
      label: Some(self.config.label),
      layout: &self.bind_group_layout,
      entries: &bind_group_entries,
    });

    {
      let mut compute_pass = encoder.begin_compute_pass(&wgpu::ComputePassDescriptor {
        label: Some(self.config.label),
        timestamp_writes: None,
      });

      // Set pipeline and bind group
      compute_pass.set_pipeline(&self.pipeline);
      compute_pass.set_bind_group(0, &bind_group, &[]);

      // Dispatch workgroups based on cells, not pixels
      // Each cell is cell_size x cell_size pixels
      let cell_width = (*width).div_ceil(data_config.cell_size);
      let cell_height = (*height).div_ceil(data_config.cell_size);
      let workgroup_count_x = cell_width.div_ceil(*workgroup_size_x);
      let workgroup_count_y = cell_height.div_ceil(*workgroup_size_y);
      let workgroup_count_z = 1;

      compute_pass.dispatch_workgroups(workgroup_count_x, workgroup_count_y, workgroup_count_z);
    }

    Ok(())
  }
}

pub struct RenderStep {
  config: RenderConfig,
  bind_group_layout: wgpu::BindGroupLayout,
  pipeline: wgpu::RenderPipeline,
  vertex_buffer: wgpu::Buffer,
  uniform_buffer: wgpu::Buffer,
}

pub struct RenderConfig {
  pub label: &'static str,
  pub fragment_shader: &'static str,
  pub vertex_shader: &'static str,
  pub buffers: Vec<BufferConfig>,
}

impl RenderStep {
  pub fn create(
    options: &sim::step::CreateOptions,
    config: RenderConfig,
  ) -> Result<Self, SimulationError> {
    let sim::step::CreateOptions {
      device,
      queue,
      surface_config,
      data,
      ..
    } = options;

    let vert_shader = create_shader_module(device, &config.vertex_shader);
    let frag_shader = create_shader_module(device, &config.fragment_shader);
    let vertex_buffer = create_quad_vertices(device);

    // Create uniform buffer for uniforms struct
    let uniform_buffer = device.create_buffer(&wgpu::BufferDescriptor {
      label: Some("uniforms"),
      size: std::mem::size_of::<sim::data::Uniforms>() as u64,
      usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
      mapped_at_creation: false,
    });

    queue.write_buffer(&uniform_buffer, 0, bytemuck::cast_slice(&[data.uniforms]));

    let mut buffer_entries = config
      .buffers
      .iter()
      .enumerate()
      .map(|(i, buffer)| wgpu::BindGroupLayoutEntry {
        binding: i as u32 + 1,
        count: None,
        visibility: wgpu::ShaderStages::FRAGMENT,
        ty: wgpu::BindingType::Buffer {
          has_dynamic_offset: false,
          min_binding_size: None,
          ty: wgpu::BufferBindingType::Storage {
            read_only: buffer.read_only,
          },
        },
      })
      .collect::<Vec<_>>();

    buffer_entries.insert(
      0,
      wgpu::BindGroupLayoutEntry {
        binding: 0,
        count: None,
        visibility: wgpu::ShaderStages::FRAGMENT,
        ty: wgpu::BindingType::Buffer {
          has_dynamic_offset: false,
          min_binding_size: None,
          ty: wgpu::BufferBindingType::Uniform,
        },
      },
    );

    // Create bind group layout
    let bind_group_layout = device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
      label: Some(config.label),
      entries: &buffer_entries.as_slice(),
    });

    // Create render pipeline
    let pipeline_layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
      label: Some(config.label),
      bind_group_layouts: &[&bind_group_layout],
      push_constant_ranges: &[],
    });

    let pipeline = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
      label: Some(config.label),
      layout: Some(&pipeline_layout),
      vertex: wgpu::VertexState {
        module: &vert_shader,
        entry_point: Some("main"),
        buffers: &[wgpu::VertexBufferLayout {
          array_stride: (std::mem::size_of::<f32>() * 2) as u64,
          step_mode: wgpu::VertexStepMode::Vertex,
          attributes: &[wgpu::VertexAttribute {
            offset: 0,
            shader_location: 0,
            format: wgpu::VertexFormat::Float32x2,
          }],
        }],
        compilation_options: Default::default(),
      },
      fragment: Some(wgpu::FragmentState {
        module: &frag_shader,
        entry_point: Some("main"),
        targets: &[Some(wgpu::ColorTargetState {
          format: surface_config.format,
          blend: Some(wgpu::BlendState::REPLACE),
          write_mask: wgpu::ColorWrites::ALL,
        })],
        compilation_options: Default::default(),
      }),
      primitive: wgpu::PrimitiveState {
        topology: wgpu::PrimitiveTopology::TriangleList,
        strip_index_format: None,
        front_face: wgpu::FrontFace::Ccw,
        cull_mode: Some(wgpu::Face::Back),
        polygon_mode: wgpu::PolygonMode::Fill,
        unclipped_depth: false,
        conservative: false,
      },
      depth_stencil: None,
      multisample: wgpu::MultisampleState {
        count: 1,
        mask: !0,
        alpha_to_coverage_enabled: false,
      },
      multiview: None,
      cache: None,
    });

    Ok(Self {
      config,
      bind_group_layout,
      pipeline,
      vertex_buffer,
      uniform_buffer,
    })
  }

  pub fn run(
    &mut self,
    encoder: &mut wgpu::CommandEncoder,
    options: &sim::step::RunOptions,
  ) -> Result<(), SimulationError> {
    let sim::step::RunOptions {
      device,
      queue: _,
      surface_view: view,
      ..
    } = options;

    let mut bind_group_entries = self
      .config
      .buffers
      .iter()
      .enumerate()
      .map(|(i, buffer)| {
        wgpu::BindGroupEntry {
          binding: i as u32 + 1,
          resource: options.data.get_buffer(buffer.label).read_binding(), // TODO: handle write buffers
        }
      })
      .collect::<Vec<_>>();

    bind_group_entries.insert(
      0,
      wgpu::BindGroupEntry {
        binding: 0,
        resource: self.uniform_buffer.as_entire_binding(),
      },
    );

    // Create bind group
    let bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
      label: None,
      layout: &self.bind_group_layout,
      entries: &bind_group_entries,
    });

    // Begin render pass targeting canvas
    {
      let mut render_pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
        label: None,
        color_attachments: &[Some(wgpu::RenderPassColorAttachment {
          view: &view,
          resolve_target: None,
          ops: wgpu::Operations {
            load: wgpu::LoadOp::Clear(wgpu::Color {
              r: 0.0,
              g: 0.0,
              b: 0.0,
              a: 1.0,
            }),
            store: wgpu::StoreOp::Store,
          },
          depth_slice: None,
        })],
        depth_stencil_attachment: None,
        occlusion_query_set: None,
        timestamp_writes: None,
      });

      // Set pipeline and bind group
      render_pass.set_pipeline(&self.pipeline);
      render_pass.set_bind_group(0, &bind_group, &[]);

      // Set vertex buffer
      render_pass.set_vertex_buffer(0, self.vertex_buffer.slice(..));

      // Draw
      render_pass.draw(0..6, 0..1);
    }

    Ok(())
  }
}
