use serde::Serialize;
use typeshare::typeshare;
use web_sys::OffscreenCanvas;

use crate::error::SimulationError;
use crate::sim;
use crate::utils::{
  format_bytes_to_mb, get_optimal_workgroup_size, get_surface_target, log_device_limits, log_table,
};

pub struct Program {
  pub device: wgpu::Device,
  pub steps: Vec<sim::Step>,
  pub queue: wgpu::Queue,
  pub surface: wgpu::Surface<'static>,
  pub surface_config: wgpu::SurfaceConfiguration,
  pub data: sim::Data,
  pub data_config: sim::Config,
  pub pass_index: u32,
  pub workgroup_size_x: u32,
  pub workgroup_size_y: u32,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct RunStats {
  pub pass_index: u32,
  pub passes_per_second: f64,
}

impl Program {
  pub async fn create(
    canvas: OffscreenCanvas,
    width: u32,
    height: u32,
    data_config: sim::Config,
  ) -> Result<Self, SimulationError> {
    let instance = wgpu::Instance::new(&wgpu::InstanceDescriptor {
      backends: wgpu::Backends::BROWSER_WEBGPU | wgpu::Backends::GL,
      flags: Default::default(),
      backend_options: Default::default(),
      memory_budget_thresholds: Default::default(),
    });

    // The SurfaceTarget::OffscreenCanvas is fine here
    // ignore the build warning that this is bad.
    // This is WASM-only code (uses web_sys::OffscreenCanvas), so rust-analyzer may show an error
    // when using host target, but it will compile correctly for WASM.
    let surface = instance
      .create_surface(get_surface_target(canvas))
      .map_err(|e| SimulationError::SurfaceCreation(format!("{e:?}")))?;

    let adapter = instance
      .request_adapter(&wgpu::RequestAdapterOptions {
        power_preference: wgpu::PowerPreference::default(),
        compatible_surface: Some(&surface),
        force_fallback_adapter: false,
      })
      .await
      .map_err(|e| SimulationError::AdapterRequest(format!("{e:?}")))?;

    // Get adapter limits to request higher buffer size if available
    let adapter_limits = adapter.limits();
    let mut required_limits = wgpu::Limits::default();
    // Request higher buffer size limit if adapter supports it
    if adapter_limits.max_buffer_size > required_limits.max_buffer_size {
      required_limits.max_buffer_size = adapter_limits.max_buffer_size;
    }
    // Request higher storage buffer binding size limit if adapter supports it
    if adapter_limits.max_storage_buffer_binding_size
      > required_limits.max_storage_buffer_binding_size
    {
      required_limits.max_storage_buffer_binding_size =
        adapter_limits.max_storage_buffer_binding_size;
    }

    let (device, queue) = adapter
      .request_device(&wgpu::DeviceDescriptor {
        label: None,
        required_features: wgpu::Features::empty(),
        required_limits,
        experimental_features: Default::default(),
        memory_hints: Default::default(),
        trace: wgpu::Trace::default(),
      })
      .await
      .map_err(|e| SimulationError::DeviceRequest(format!("{e:?}")))?;

    // Log device limits for 3D textures
    log_device_limits(&device.limits());

    let surface_caps = surface.get_capabilities(&adapter);
    let surface_format = surface_caps
      .formats
      .iter()
      .copied()
      .find(|f| f.is_srgb())
      .unwrap_or(surface_caps.formats[0]);

    let surface_config = wgpu::SurfaceConfiguration {
      usage: wgpu::TextureUsages::RENDER_ATTACHMENT,
      format: surface_format,
      width,
      height,
      present_mode: surface_caps.present_modes[0],
      alpha_mode: wgpu::CompositeAlphaMode::PreMultiplied,
      view_formats: vec![],
      desired_maximum_frame_latency: 2,
    };

    surface.configure(&device, &surface_config);

    let data = sim::Data::create(&device, &data_config, width, height);
    let (workgroup_size_x, workgroup_size_y) = get_optimal_workgroup_size(width, height);

    let create_options = sim::step::CreateOptions {
      device: device.clone(),
      queue: queue.clone(),
      surface_config: surface_config.clone(),
      workgroup_size_x,
      workgroup_size_y,
      data: &data,
    };

    let steps = vec![
      sim::ComputeStep::create(
        &create_options,
        sim::step::ComputeConfig {
          label: "reset_buffers",
          compute_shader: include_str!("./steps/0.reset_buffers.wgsl"),
          buffers: vec![
            sim::step::BufferConfig {
              label: "genotype_weights_shifts",
              read_only: false,
            },
            sim::step::BufferConfig {
              label: "phenotype_weights",
              read_only: false,
            },
            sim::step::BufferConfig {
              label: "fitness_scores",
              read_only: false,
            },
            sim::step::BufferConfig {
              label: "partnership_selection_weights",
              read_only: false,
            },
            sim::step::BufferConfig {
              label: "partnership_indexes",
              read_only: false,
            },
          ],
        },
      )?
      .into(),
      sim::ComputeStep::create(
        &create_options,
        sim::step::ComputeConfig {
          label: "compute_environment_shifts",
          compute_shader: include_str!("./steps/1.compute_environment_shifts.wgsl"),
          buffers: vec![
            sim::step::BufferConfig {
              label: "regional_env_epi_topology",
              read_only: true,
            },
            sim::step::BufferConfig {
              label: "global_env_epi_topology",
              read_only: true,
            },
            sim::step::BufferConfig {
              label: "genotype_weights_shifts",
              read_only: false,
            },
          ],
        },
      )?
      .into(),
      sim::ComputeStep::create(
        &create_options,
        sim::step::ComputeConfig {
          label: "compute_epistasis_shifts",
          compute_shader: include_str!("./steps/2.compute_epistasis_shifts.wgsl"),
          buffers: vec![
            sim::step::BufferConfig {
              label: "genotype_weights",
              read_only: true,
            },
            sim::step::BufferConfig {
              label: "genotype_epistasis_topology",
              read_only: true,
            },
            sim::step::BufferConfig {
              label: "genotype_weights_shifts",
              read_only: false,
            },
          ],
        },
      )?
      .into(),
      sim::ComputeStep::create(
        &create_options,
        sim::step::ComputeConfig {
          label: "compute_phenotypes",
          compute_shader: include_str!("./steps/3.compute_phenotypes.wgsl"),
          buffers: vec![
            sim::step::BufferConfig {
              label: "genotype_weights",
              read_only: true,
            },
            sim::step::BufferConfig {
              label: "genotype_weights_shifts",
              read_only: true,
            },
            sim::step::BufferConfig {
              label: "phenotype_topology",
              read_only: true,
            },
            sim::step::BufferConfig {
              label: "phenotype_weights",
              read_only: false,
            },
          ],
        },
      )?
      .into(),
      sim::ComputeStep::create(
        &create_options,
        sim::step::ComputeConfig {
          label: "compute_fitness_scores",
          compute_shader: include_str!("./steps/4.compute_fitness_scores.wgsl"),
          buffers: vec![
            sim::step::BufferConfig {
              label: "regional_env_fit_topology",
              read_only: true,
            },
            sim::step::BufferConfig {
              label: "global_env_fit_topology",
              read_only: true,
            },
            sim::step::BufferConfig {
              label: "phenotype_weights",
              read_only: true,
            },
            sim::step::BufferConfig {
              label: "fitness_scores",
              read_only: false,
            },
          ],
        },
      )?
      .into(),
      sim::ComputeStep::create(
        &create_options,
        sim::step::ComputeConfig {
          label: "compute_partnerships",
          compute_shader: include_str!("./steps/5.compute_partnerships.wgsl"),
          buffers: vec![
            sim::step::BufferConfig {
              label: "phenotype_weights",
              read_only: true,
            },
            sim::step::BufferConfig {
              label: "fitness_scores",
              read_only: true,
            },
            sim::step::BufferConfig {
              label: "partnership_topology",
              read_only: true,
            },
            sim::step::BufferConfig {
              label: "partnership_selection_weights",
              read_only: false,
            },
            sim::step::BufferConfig {
              label: "partnership_indexes",
              read_only: false,
            },
          ],
        },
      )?
      .into(),
      sim::ComputeStep::create(
        &create_options,
        sim::step::ComputeConfig {
          label: "compute_next_generation",
          compute_shader: include_str!("./steps/6.compute_next_generation.wgsl"),
          buffers: vec![
            sim::step::BufferConfig {
              label: "genotype_weights",
              read_only: true,
            },
            sim::step::BufferConfig {
              label: "genotype_weights",
              read_only: false,
            },
            sim::step::BufferConfig {
              label: "partnership_indexes",
              read_only: true,
            },
          ],
        },
      )?
      .into(),
      sim::RenderStep::create(
        &create_options,
        sim::step::RenderConfig {
          label: "render",
          fragment_shader: include_str!("./steps/render_fragment.wgsl"),
          vertex_shader: include_str!("./steps/render_vertex.wgsl"),
          buffers: vec![
            sim::step::BufferConfig {
              label: "regional_env_fit_topology",
              read_only: true,
            },
            sim::step::BufferConfig {
              label: "phenotype_weights",
              read_only: true,
            },
            sim::step::BufferConfig {
              label: "fitness_scores",
              read_only: true,
            },
          ],
        },
      )?
      .into(),
    ];

    Ok(Program {
      device,
      queue,
      steps,
      surface,
      surface_config,
      data,
      data_config,
      pass_index: 0,
      workgroup_size_x,
      workgroup_size_y,
    })
  }

  pub fn run(&mut self, elapsed: f64) -> Result<RunStats, SimulationError> {
    // Acquire surface texture once per frame (shared by all render steps)
    let output = self.surface.get_current_texture().map_err(|e| {
      SimulationError::SurfaceTexture(format!("Failed to get surface texture: {e:?}"))
    })?;
    let view = output.texture.create_view(&Default::default());

    // Note: TextureView, Device, Queue, and Sampler are cloned here because
    // SimulationRunState requires owned values. These are lightweight handles
    // in WebGPU, so cloning is cheap and necessary for the state structure.
    let run_options = sim::step::RunOptions {
      device: self.device.clone(),
      queue: self.queue.clone(),
      width: self.surface_config.width,
      height: self.surface_config.height,
      data: &self.data,
      data_config: &self.data_config,
      surface_view: &view,
      workgroup_size_x: self.workgroup_size_x,
      workgroup_size_y: self.workgroup_size_y,
    };

    let mut encoder = self
      .device
      .create_command_encoder(&wgpu::CommandEncoderDescriptor { label: None });

    for step in &mut self.steps {
      step
        .run(&mut encoder, &run_options)
        .map_err(|e| SimulationError::StepExecution(format!("{e:?}")))?;
    }

    // Finish and submit the command encoder after all steps have recorded their commands
    run_options.queue.submit(std::iter::once(encoder.finish()));
    output.present();

    // Swap ping-pong buffers AFTER compute step has been submitted
    // Next frame: what was write becomes read, what was read becomes write
    self.data.swap();

    // Increment pass index
    self.pass_index += 1;

    Ok(RunStats {
      pass_index: self.pass_index,
      passes_per_second: self.pass_index as f64 / elapsed,
    })
  }

  pub fn reset(&mut self) -> Result<(), SimulationError> {
    self.pass_index = 0;
    Ok(())
  }

  pub fn clear_canvas(&mut self) -> Result<(), SimulationError> {
    // Get the current surface texture
    let output = self.surface.get_current_texture().map_err(|e| {
      SimulationError::SurfaceTexture(format!("Failed to get surface texture: {e:?}"))
    })?;

    let view = output.texture.create_view(&Default::default());

    // Create a command encoder
    let mut encoder = self
      .device
      .create_command_encoder(&wgpu::CommandEncoderDescriptor { label: None });

    // Begin a render pass that clears the canvas to transparent
    {
      encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
        label: Some("clear_canvas"),
        color_attachments: &[Some(wgpu::RenderPassColorAttachment {
          view: &view,
          resolve_target: None,
          ops: wgpu::Operations {
            load: wgpu::LoadOp::Clear(wgpu::Color {
              r: 0.0,
              g: 0.0,
              b: 0.0,
              a: 0.0,
            }),
            store: wgpu::StoreOp::Store,
          },
          depth_slice: None,
        })],
        depth_stencil_attachment: None,
        occlusion_query_set: None,
        timestamp_writes: None,
      });
    }

    // Submit the command to clear the canvas
    self.queue.submit(std::iter::once(encoder.finish()));
    output.present();

    Ok(())
  }

  pub fn resize(&mut self, _width: u32, _height: u32) -> Result<(), SimulationError> {
    Ok(())
  }

  pub fn log_stats(&self) -> Result<(), SimulationError> {
    let width = self.surface_config.width;
    let height = self.surface_config.height;
    let cells = self.data_config.get_cell_count(width, height);

    log_table(
      "Simulation Stats",
      &[
        ("width x height", format!("{} x {}", width, height).as_str()),
        ("height", height.to_string().as_str()),
        ("cell_count", cells.to_string().as_str()),
        (
          "memory_usage",
          format_bytes_to_mb(self.data.memory_usage_actual()).as_str(),
        ),
        (
          "workgroup_size_x",
          self.workgroup_size_x.to_string().as_str(),
        ),
        (
          "workgroup_size_y",
          self.workgroup_size_y.to_string().as_str(),
        ),
      ],
    );
    Ok(())
  }

  pub fn read_buffer_slice(&self, label: &str, cell_index: u32) -> Result<(), String> {
    self
      .data
      .read_buffer_slice(&self.device, &self.queue, label, cell_index);
    Ok(())
  }
}
