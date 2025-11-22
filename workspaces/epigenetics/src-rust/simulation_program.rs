use wasm_bindgen::JsValue;
use web_sys::OffscreenCanvas;

use crate::{error::SimulationError, utils::log_table};
use wgpu::{
  AddressMode, Backends, Device, DeviceDescriptor, Features, FilterMode, Instance,
  InstanceDescriptor, Limits, PowerPreference, Queue, RequestAdapterOptions, Sampler,
  SamplerDescriptor, Surface, SurfaceConfiguration, Texture, TextureUsages, TextureView,
};

use crate::{
  simulation_steps::{SimulationStepCompute, SimulationStepRender},
  utils::{create_3d_texture_and_view, create_seed_texture_and_view, log_device_limits},
};

pub struct SimulationProgram {
  pub device: Device,
  pub steps: Vec<Box<dyn SimulationStep>>,
  pub queue: Queue,
  pub sampler: Sampler,
  pub surface: Surface<'static>,
  pub surface_config: SurfaceConfiguration,
  pub texture_a: Texture,
  pub texture_view_a: TextureView,
  pub texture_b: Texture,
  pub texture_view_b: TextureView,
  pub seed_texture: Texture,
  pub seed_texture_view: TextureView,
  pub depth: u32,
  pub pass_index: u32,
}

impl SimulationProgram {
  pub async fn create(
    canvas: OffscreenCanvas,
    width: u32,
    height: u32,
  ) -> Result<Self, SimulationError> {
    let instance = Instance::new(&InstanceDescriptor {
      backends: Backends::BROWSER_WEBGPU | Backends::GL,
      flags: Default::default(),
      backend_options: Default::default(),
      memory_budget_thresholds: Default::default(),
    });

    let surface = instance
      // The SurfaceTarget::OffscreenCanvas is fine here
      // ignore the build warning that this is bad.
      .create_surface(wgpu::SurfaceTarget::OffscreenCanvas(canvas))
      .map_err(|e| SimulationError::SurfaceCreation(format!("{e:?}")))?;

    let adapter = instance
      .request_adapter(&RequestAdapterOptions {
        power_preference: PowerPreference::default(),
        compatible_surface: Some(&surface),
        force_fallback_adapter: false,
      })
      .await
      .map_err(|e| SimulationError::AdapterRequest(format!("{e:?}")))?;

    // Get adapter limits to request higher buffer size if available
    let adapter_limits = adapter.limits();
    let mut required_limits = Limits::default();
    // Request higher buffer size limit if adapter supports it
    if adapter_limits.max_buffer_size > required_limits.max_buffer_size {
      required_limits.max_buffer_size = adapter_limits.max_buffer_size;
    }

    let (device, queue) = adapter
      .request_device(&DeviceDescriptor {
        label: None,
        required_features: Features::empty(),
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

    let surface_config = SurfaceConfiguration {
      usage: TextureUsages::RENDER_ATTACHMENT,
      format: surface_format,
      width,
      height,
      present_mode: surface_caps.present_modes[0],
      alpha_mode: surface_caps.alpha_modes[0],
      view_formats: vec![],
      desired_maximum_frame_latency: 2,
    };

    surface.configure(&device, &surface_config);

    // Limit depth to a reasonable value to avoid memory issues
    // Calculate max safe depth based on texture size limits
    // R32Float = 4 bytes per pixel (single channel)
    // Use max/8 as initial depth (smallest factor option)
    let max_depth = device.limits().max_texture_dimension_3d;
    let depth = (max_depth / 8).max(1); // Ensure at least 1 layer

    // Create 3D textures for simulation data
    let (texture_a, texture_view_a) =
      create_3d_texture_and_view("texture_a", &device, width, height, depth);
    let (texture_b, texture_view_b) =
      create_3d_texture_and_view("texture_b", &device, width, height, depth);

    // Create 2D seed texture with random values
    let (seed_texture, seed_texture_view) = create_seed_texture_and_view(&device, width, height);

    // Initialize seed texture with random values - will be done in compute shader on first pass
    // For now, leave it uninitialized (will be zero, which is fine for our hash function)
    let sampler = device.create_sampler(&SamplerDescriptor {
      label: None,
      address_mode_u: AddressMode::ClampToEdge,
      address_mode_v: AddressMode::ClampToEdge,
      address_mode_w: AddressMode::ClampToEdge,
      mag_filter: FilterMode::Nearest,
      min_filter: FilterMode::Nearest,
      mipmap_filter: FilterMode::Nearest,
      ..Default::default()
    });

    let steps = vec![
      Box::new(
        SimulationStepCompute::create(&device, &surface_config)
          .map_err(|e| SimulationError::StepCreation(format!("Compute step: {e:?}")))?,
      ) as Box<dyn SimulationStep>,
      Box::new(
        SimulationStepRender::create(&device, &surface_config)
          .map_err(|e| SimulationError::StepCreation(format!("Render step: {e:?}")))?,
      ) as Box<dyn SimulationStep>,
    ];

    Ok(SimulationProgram {
      device,
      queue,
      sampler,
      steps,
      surface,
      surface_config,
      texture_a,
      texture_view_a,
      texture_b,
      texture_view_b,
      seed_texture,
      seed_texture_view,
      depth,
      pass_index: 0,
    })
  }

  pub fn run(&mut self, _elapsed: f64) -> Result<(), SimulationError> {
    // Note: TextureView, Device, Queue, and Sampler are cloned here because
    // SimulationRunState requires owned values. These are lightweight handles
    // in WebGPU, so cloning is cheap and necessary for the state structure.
    let mut run_state = SimulationRunState {
      device: self.device.clone(),
      queue: self.queue.clone(),
      width: self.surface_config.width,
      height: self.surface_config.height,
      depth: self.depth,
      pass_index: self.pass_index,
      read_texture_view: self.texture_view_a.clone(),
      write_texture_view: self.texture_view_b.clone(),
      seed_texture_view: self.seed_texture_view.clone(),
      sampler: self.sampler.clone(),
      surface: &self.surface,
    };

    for step in &self.steps {
      step
        .run(&mut run_state)
        .map_err(|e| SimulationError::StepExecution(format!("{e:?}")))?;
    }

    // Swap buffers AFTER render for next frame
    // Next frame: what was write becomes read, what was read becomes write
    std::mem::swap(&mut self.texture_view_a, &mut self.texture_view_b);
    std::mem::swap(&mut self.texture_a, &mut self.texture_b);

    // Increment pass index
    self.pass_index += 1;

    Ok(())
  }

  pub fn resize(&mut self, width: u32, height: u32) -> Result<(), SimulationError> {
    // Store old dimensions for copying
    let old_width = self.surface_config.width;
    let old_height = self.surface_config.height;

    // Update surface configuration
    self.surface_config.width = width;
    self.surface_config.height = height;
    self.surface.configure(&self.device, &self.surface_config);

    // Create new 3D textures
    let (new_texture_a, new_texture_view_a) =
      create_3d_texture_and_view("texture_a", &self.device, width, height, self.depth);
    let (new_texture_b, new_texture_view_b) =
      create_3d_texture_and_view("texture_b", &self.device, width, height, self.depth);

    // Create new seed texture
    let (new_seed_texture, new_seed_texture_view) =
      create_seed_texture_and_view(&self.device, width, height);

    // Copy old texture data to new textures if dimensions changed
    if old_width != width || old_height != height {
      let mut encoder = self
        .device
        .create_command_encoder(&wgpu::CommandEncoderDescriptor {
          label: Some("Resize encoder"),
        });

      // Calculate copy region (min of old and new dimensions)
      let copy_width = old_width.min(width);
      let copy_height = old_height.min(height);

      // Copy texture A
      encoder.copy_texture_to_texture(
        wgpu::TexelCopyTextureInfo {
          texture: &self.texture_a,
          mip_level: 0,
          origin: wgpu::Origin3d::ZERO,
          aspect: wgpu::TextureAspect::All,
        },
        wgpu::TexelCopyTextureInfo {
          texture: &new_texture_a,
          mip_level: 0,
          origin: wgpu::Origin3d::ZERO,
          aspect: wgpu::TextureAspect::All,
        },
        wgpu::Extent3d {
          width: copy_width,
          height: copy_height,
          depth_or_array_layers: 1,
        },
      );

      // Copy texture B
      encoder.copy_texture_to_texture(
        wgpu::TexelCopyTextureInfo {
          texture: &self.texture_b,
          mip_level: 0,
          origin: wgpu::Origin3d::ZERO,
          aspect: wgpu::TextureAspect::All,
        },
        wgpu::TexelCopyTextureInfo {
          texture: &new_texture_b,
          mip_level: 0,
          origin: wgpu::Origin3d::ZERO,
          aspect: wgpu::TextureAspect::All,
        },
        wgpu::Extent3d {
          width: copy_width,
          height: copy_height,
          depth_or_array_layers: 1,
        },
      );

      self.queue.submit(std::iter::once(encoder.finish()));
    }

    // Replace old textures with new ones
    self.texture_a = new_texture_a;
    self.texture_view_a = new_texture_view_a;
    self.texture_b = new_texture_b;
    self.texture_view_b = new_texture_view_b;
    self.seed_texture = new_seed_texture;
    self.seed_texture_view = new_seed_texture_view;

    Ok(())
  }

  pub fn set_texture_depth(&mut self, depth: u32) -> Result<(), SimulationError> {
    let max_depth = self.device.limits().max_texture_dimension_3d;
    let new_depth = depth.min(max_depth);

    if new_depth == self.depth {
      return Ok(()); // No change needed
    }

    // Store old depth for copying
    let old_depth = self.depth;
    let width = self.surface_config.width;
    let height = self.surface_config.height;

    // Create new 3D textures with new depth
    let (new_texture_a, new_texture_view_a) =
      create_3d_texture_and_view("texture_a", &self.device, width, height, new_depth);
    let (new_texture_b, new_texture_view_b) =
      create_3d_texture_and_view("texture_b", &self.device, width, height, new_depth);

    // Copy old texture data to new textures
    // Copy the minimum of old and new depth layers
    let copy_depth = old_depth.min(new_depth);
    if copy_depth > 0 {
      let mut encoder = self
        .device
        .create_command_encoder(&wgpu::CommandEncoderDescriptor {
          label: Some("Set texture depth encoder"),
        });

      // Copy texture A
      encoder.copy_texture_to_texture(
        wgpu::TexelCopyTextureInfo {
          texture: &self.texture_a,
          mip_level: 0,
          origin: wgpu::Origin3d::ZERO,
          aspect: wgpu::TextureAspect::All,
        },
        wgpu::TexelCopyTextureInfo {
          texture: &new_texture_a,
          mip_level: 0,
          origin: wgpu::Origin3d::ZERO,
          aspect: wgpu::TextureAspect::All,
        },
        wgpu::Extent3d {
          width,
          height,
          depth_or_array_layers: copy_depth,
        },
      );

      // Copy texture B
      encoder.copy_texture_to_texture(
        wgpu::TexelCopyTextureInfo {
          texture: &self.texture_b,
          mip_level: 0,
          origin: wgpu::Origin3d::ZERO,
          aspect: wgpu::TextureAspect::All,
        },
        wgpu::TexelCopyTextureInfo {
          texture: &new_texture_b,
          mip_level: 0,
          origin: wgpu::Origin3d::ZERO,
          aspect: wgpu::TextureAspect::All,
        },
        wgpu::Extent3d {
          width,
          height,
          depth_or_array_layers: copy_depth,
        },
      );

      self.queue.submit(std::iter::once(encoder.finish()));
    }

    // Replace old textures with new ones
    self.texture_a = new_texture_a;
    self.texture_view_a = new_texture_view_a;
    self.texture_b = new_texture_b;
    self.texture_view_b = new_texture_view_b;
    self.depth = new_depth;

    // Reset pass index since we're starting fresh
    self.pass_index = 0;

    Ok(())
  }

  pub fn log_stats(&self) -> Result<(), SimulationError> {
    let width = self.surface_config.width;
    let height = self.surface_config.height;
    let cells = width * height;
    let memory_usage = (self.surface_config.width as u64
      * self.surface_config.height as u64
      * self.depth as u64
      * 4) // R32Float = 4 bytes per pixel (single channel)
      / (1024 * 1024);

    log_table(
      "Simulation Stats",
      &[
        ("Width", width.to_string().as_str()),
        ("Height", height.to_string().as_str()),
        ("Cells", cells.to_string().as_str()),
        ("Depth", self.depth.to_string().as_str()),
        ("Pass index", self.pass_index.to_string().as_str()),
        ("Memory usage", format!("{memory_usage} MB").as_str()),
      ],
    );
    Ok(())
  }
}

pub struct SimulationRunState<'a> {
  pub device: Device,
  pub queue: Queue,
  pub width: u32,
  pub height: u32,
  pub depth: u32,
  pub pass_index: u32,
  pub read_texture_view: TextureView,
  pub write_texture_view: TextureView,
  pub seed_texture_view: TextureView,
  pub sampler: Sampler,
  pub surface: &'a Surface<'a>,
}

pub trait SimulationStep {
  fn create(device: &Device, surface_config: &SurfaceConfiguration) -> Result<Self, JsValue>
  where
    Self: Sized;
  fn run(&self, state: &mut SimulationRunState) -> Result<(), JsValue>;
}
