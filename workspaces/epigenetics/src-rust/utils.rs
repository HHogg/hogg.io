use wasm_bindgen::closure::Closure;
use wasm_bindgen::JsCast;
use wasm_bindgen::JsValue;
use web_sys::DedicatedWorkerGlobalScope;
use wgpu::TextureDescriptor;
use wgpu::TextureFormat;
use wgpu::TextureUsages;
use wgpu::{util::DeviceExt, Buffer, Device, ShaderModule};
use wgpu::{Texture, TextureView};

pub fn create_quad_vertices(device: &Device) -> Buffer {
  // Create a full-screen quad (two triangles)
  let vertices: [f32; 12] = [
    -1.0, -1.0, // bottom-left
    1.0, -1.0, // bottom-right
    -1.0, 1.0, // top-left
    1.0, -1.0, // bottom-right
    1.0, 1.0, // top-right
    -1.0, 1.0, // top-left
  ];

  device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
    label: Some("Quad vertices"),
    contents: bytemuck::cast_slice(&vertices),
    usage: wgpu::BufferUsages::VERTEX,
  })
}

pub fn create_shader_module(device: &Device, source: &str) -> ShaderModule {
  device.create_shader_module(wgpu::ShaderModuleDescriptor {
    label: None,
    source: wgpu::ShaderSource::Wgsl(source.into()),
  })
}

pub fn create_texture_and_view(device: &Device, width: u32, height: u32) -> (Texture, TextureView) {
  let texture = device.create_texture(&TextureDescriptor {
    label: None,
    size: wgpu::Extent3d {
      width,
      height,
      depth_or_array_layers: 1,
    },
    mip_level_count: 1,
    sample_count: 1,
    dimension: wgpu::TextureDimension::D2,
    format: TextureFormat::Rgba8Unorm,
    usage: TextureUsages::TEXTURE_BINDING
      | TextureUsages::RENDER_ATTACHMENT
      | TextureUsages::COPY_DST
      | TextureUsages::COPY_SRC,
    view_formats: &[],
  });

  let view = texture.create_view(&Default::default());
  (texture, view)
}

pub fn set_timeout<T: AsRef<JsValue>>(callback: T, timeout: u32) -> Result<u32, JsValue> {
  let global = js_sys::global();
  let worker: DedicatedWorkerGlobalScope = global
    .dyn_into()
    .map_err(|_| JsValue::from_str("Failed to get worker global scope"))?;

  let timeout_id = worker
    .set_timeout_with_callback_and_timeout_and_arguments_0(
      callback.as_ref().unchecked_ref(),
      timeout as i32,
    )
    .map_err(|e| JsValue::from_str(&format!("Failed to start timeout: {e:?}")))?;
  Ok(timeout_id as u32)
}

pub fn request_animation_frame(callback: &Closure<dyn FnMut()>) -> Result<u32, JsValue> {
  // Use requestAnimationFrame from the worker global scope
  // This is available in modern browsers for OffscreenCanvas workers
  let global = js_sys::global();
  let raf_fn = js_sys::Reflect::get(&global, &"requestAnimationFrame".into())
    .ok()
    .and_then(|v| v.dyn_into::<js_sys::Function>().ok());

  if let Some(request_animation_frame) = raf_fn {
    let animation_frame_id = request_animation_frame
      .call1(&global, callback.as_ref().unchecked_ref())
      .ok()
      .and_then(|v| v.as_f64())
      .map(|v| v as u32)
      .ok_or_else(|| JsValue::from_str("Failed to call requestAnimationFrame"))?;

    Ok(animation_frame_id)
  } else {
    // Fallback to setTimeout if requestAnimationFrame is not available
    set_timeout(callback, 16)
  }
}

pub fn clear_timeout(timeout_id: u32) -> Result<(), JsValue> {
  let global = js_sys::global();
  let cancel_raf_fn = js_sys::Reflect::get(&global, &"cancelAnimationFrame".into())
    .ok()
    .and_then(|v| v.dyn_into::<js_sys::Function>().ok());

  if let Some(cancel_animation_frame) = cancel_raf_fn {
    // Use cancelAnimationFrame
    let _ = cancel_animation_frame.call1(&global, &(timeout_id as f64).into());
  } else {
    // Fallback to clearTimeout
    if let Ok(worker) = global.dyn_into::<DedicatedWorkerGlobalScope>() {
      worker.clear_timeout_with_handle(timeout_id as i32);
    }
  }

  Ok(())
}
