use wasm_bindgen::JsValue;
use wgpu::{BindGroupLayout, Buffer, Device, RenderPipeline, SurfaceConfiguration};

use crate::{
  simulation_program::{SimulationRunState, SimulationStep},
  utils::{create_quad_vertices, create_shader_module},
};

const VERTEX_SHADER: &str = include_str!("./wgsl/vertex.wgsl");
const FRAGMENT_SHADER: &str = include_str!("./wgsl/fragment.wgsl");

pub struct SimulationStepRender {
  pub pipeline: RenderPipeline,
  pub vertex_buffer: Buffer,
  pub bind_group_layout: BindGroupLayout,
  pub uniform_time_buffer: Buffer,
  pub uniform_resolution_buffer: Buffer,
}

impl SimulationStep for SimulationStepRender {
  fn create(device: &Device, surface_config: &SurfaceConfiguration) -> Result<Self, JsValue> {
    let vert_shader = create_shader_module(device, VERTEX_SHADER);
    let frag_shader = create_shader_module(device, FRAGMENT_SHADER);
    let vertex_buffer = create_quad_vertices(device);

    // Create uniform buffers
    let uniform_time_buffer = device.create_buffer(&wgpu::BufferDescriptor {
      label: Some("Time uniform buffer"),
      size: std::mem::size_of::<f32>() as u64,
      usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
      mapped_at_creation: false,
    });

    let uniform_resolution_buffer = device.create_buffer(&wgpu::BufferDescriptor {
      label: Some("Resolution uniform buffer"),
      size: (std::mem::size_of::<f32>() * 2) as u64,
      usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
      mapped_at_creation: false,
    });

    // Create bind group layout (same as compute)
    let bind_group_layout = device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
      label: None,
      entries: &[
        // u_time uniform buffer
        wgpu::BindGroupLayoutEntry {
          binding: 0,
          visibility: wgpu::ShaderStages::FRAGMENT,
          ty: wgpu::BindingType::Buffer {
            ty: wgpu::BufferBindingType::Uniform,
            has_dynamic_offset: false,
            min_binding_size: None,
          },
          count: None,
        },
        // u_resolution uniform buffer
        wgpu::BindGroupLayoutEntry {
          binding: 1,
          visibility: wgpu::ShaderStages::FRAGMENT,
          ty: wgpu::BindingType::Buffer {
            ty: wgpu::BufferBindingType::Uniform,
            has_dynamic_offset: false,
            min_binding_size: None,
          },
          count: None,
        },
        // compute_texture
        wgpu::BindGroupLayoutEntry {
          binding: 2,
          visibility: wgpu::ShaderStages::FRAGMENT,
          ty: wgpu::BindingType::Texture {
            multisampled: false,
            view_dimension: wgpu::TextureViewDimension::D2,
            sample_type: wgpu::TextureSampleType::Float { filterable: true },
          },
          count: None,
        },
        // compute_sampler
        wgpu::BindGroupLayoutEntry {
          binding: 3,
          visibility: wgpu::ShaderStages::FRAGMENT,
          ty: wgpu::BindingType::Sampler(wgpu::SamplerBindingType::Filtering),
          count: None,
        },
      ],
    });

    // Create render pipeline
    let pipeline_layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
      label: None,
      bind_group_layouts: &[&bind_group_layout],
      push_constant_ranges: &[],
    });

    let pipeline = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
      label: None,
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
      pipeline,
      vertex_buffer,
      bind_group_layout,
      uniform_time_buffer,
      uniform_resolution_buffer,
    })
  }

  fn run(&self, state: &mut SimulationRunState) -> Result<(), JsValue> {
    let SimulationRunState {
      device,
      queue,
      width,
      height,
      elapsed_time,
      read_texture_view,
      sampler,
      surface,
      ..
    } = state;

    // Update uniform buffers
    queue.write_buffer(
      &self.uniform_time_buffer,
      0,
      bytemuck::cast_slice(&[*elapsed_time as f32]),
    );

    let resolution_values: [f32; 2] = [*width as f32, *height as f32];
    queue.write_buffer(
      &self.uniform_resolution_buffer,
      0,
      bytemuck::cast_slice(&resolution_values),
    );

    let bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
      label: None,
      layout: &self.bind_group_layout,
      entries: &[
        wgpu::BindGroupEntry {
          binding: 0,
          resource: self.uniform_time_buffer.as_entire_binding(),
        },
        wgpu::BindGroupEntry {
          binding: 1,
          resource: self.uniform_resolution_buffer.as_entire_binding(),
        },
        wgpu::BindGroupEntry {
          binding: 2,
          resource: wgpu::BindingResource::TextureView(read_texture_view),
        },
        wgpu::BindGroupEntry {
          binding: 3,
          resource: wgpu::BindingResource::Sampler(sampler),
        },
      ],
    });

    let output = surface
      .get_current_texture()
      .map_err(|e| JsValue::from_str(&format!("Failed to get surface texture: {e:?}")))?;
    let view = output.texture.create_view(&Default::default());

    // Create command encoder
    let mut encoder =
      device.create_command_encoder(&wgpu::CommandEncoderDescriptor { label: None });

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

    // Submit command buffer
    queue.submit(std::iter::once(encoder.finish()));
    output.present();

    Ok(())
  }
}
