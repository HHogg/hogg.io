use wasm_bindgen::JsValue;
use web_sys::OffscreenCanvas;

use crate::error::SimulationError;
use wgpu::{
  AddressMode, Backends, Device, DeviceDescriptor, Features, FilterMode, Instance,
  InstanceDescriptor, Limits, PowerPreference, Queue, RequestAdapterOptions, Sampler,
  SamplerDescriptor, Surface, SurfaceConfiguration, Texture, TextureUsages, TextureView,
};

use crate::{
  simulation_steps::{SimulationStepCompute, SimulationStepRender},
  utils::create_texture_and_view,
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

    let (device, queue) = adapter
      .request_device(&DeviceDescriptor {
        label: None,
        required_features: Features::empty(),
        required_limits: Limits::default(),
        experimental_features: Default::default(),
        memory_hints: Default::default(),
        trace: wgpu::Trace::default(),
      })
      .await
      .map_err(|e| SimulationError::DeviceRequest(format!("{e:?}")))?;

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

    let (texture_a, texture_view_a) = create_texture_and_view(&device, width, height);
    let (texture_b, texture_view_b) = create_texture_and_view(&device, width, height);

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
    })
  }

  pub fn run(&self, elapsed: f64) -> Result<(), SimulationError> {
    // Note: TextureView, Device, Queue, and Sampler are cloned here because
    // SimulationRunState requires owned values. These are lightweight handles
    // in WebGPU, so cloning is cheap and necessary for the state structure.
    let mut run_state = SimulationRunState {
      device: self.device.clone(),
      queue: self.queue.clone(),
      width: self.surface_config.width,
      height: self.surface_config.height,
      elapsed_time: elapsed,
      read_texture_view: self.texture_view_a.clone(),
      write_texture_view: self.texture_view_b.clone(),
      sampler: self.sampler.clone(),
      surface: &self.surface,
    };

    for step in &self.steps {
      step
        .run(&mut run_state)
        .map_err(|e| SimulationError::StepExecution(format!("{e:?}")))?;
    }

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

    // Create new textures
    let (new_texture_a, new_texture_view_a) = create_texture_and_view(&self.device, width, height);
    let (new_texture_b, new_texture_view_b) = create_texture_and_view(&self.device, width, height);

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

    Ok(())
  }
}

pub struct SimulationRunState<'a> {
  pub device: Device,
  pub queue: Queue,
  pub width: u32,
  pub height: u32,
  pub elapsed_time: f64,
  pub read_texture_view: TextureView,
  pub write_texture_view: TextureView,
  pub sampler: Sampler,
  pub surface: &'a Surface<'a>,
}

impl<'a> SimulationRunState<'a> {
  pub fn swap_buffers(&mut self) {
    std::mem::swap(&mut self.read_texture_view, &mut self.write_texture_view);
  }
}

pub trait SimulationStep {
  fn create(device: &Device, surface_config: &SurfaceConfiguration) -> Result<Self, JsValue>
  where
    Self: Sized;
  fn run(&self, state: &mut SimulationRunState) -> Result<(), JsValue>;
}
