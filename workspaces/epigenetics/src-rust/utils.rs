use wasm_bindgen::closure::Closure;
use wasm_bindgen::JsCast;
use wasm_bindgen::JsValue;
use web_sys::DedicatedWorkerGlobalScope;
use wgpu::TextureDescriptor;
use wgpu::TextureFormat;
use wgpu::TextureUsages;
use wgpu::{util::DeviceExt, Buffer, Device, ShaderModule};
use wgpu::{Texture, TextureView};

use crate::post_message::Message;

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

pub fn log_table(title: &str, rows: &[(&str, &str)]) {
  if rows.is_empty() {
    return;
  }

  // Calculate max width for each column
  let max_label_width = rows.iter().map(|(label, _)| label.len()).max().unwrap_or(0);
  let max_value_width = rows.iter().map(|(_, value)| value.len()).max().unwrap_or(0);

  // Calculate total width (label + " │ " + value + borders)
  let total_width = max_label_width + 3 + max_value_width + 2; // 3 for " │ ", 2 for borders

  // Create horizontal border
  let horizontal_border = "─".repeat(total_width);

  // Build table rows
  // Top border with corners
  let top_border = format!("┌{}┐", horizontal_border);
  let mut table_rows = vec![top_border];

  // Title row
  let padded_title = format!("{:<width$}", title, width = total_width - 2);
  table_rows.push(format!("│ {} │", padded_title));

  // Separator between title and content
  let title_separator = format!("├{}┤", "─".repeat(total_width));
  table_rows.push(title_separator);

  // Data rows
  for (label, value) in rows {
    let padded_label = format!("{:<width$}", label, width = max_label_width);
    let padded_value = format!("{:<width$}", value, width = max_value_width);
    table_rows.push(format!("│ {} │ {} │", padded_label, padded_value));
  }

  // Bottom border with corners
  let bottom_border = format!("└{}┘", horizontal_border);
  table_rows.push(bottom_border);

  // Log the table
  table_rows
    .iter()
    .for_each(|row| Message::Log(row.clone()).send());
}

pub fn log_device_limits(limits: &wgpu::Limits) {
  let max_buffer_size_mb = limits.max_buffer_size as f64 / (1024.0 * 1024.0);
  let max_storage_buffer_binding_size_mb =
    limits.max_storage_buffer_binding_size as f64 / (1024.0 * 1024.0);

  // Create string values first so we can reference them
  let texture_dim_3d = format!("{}", limits.max_texture_dimension_3d);
  let sampled_textures = format!("{}", limits.max_sampled_textures_per_shader_stage);
  let storage_textures = format!("{}", limits.max_storage_textures_per_shader_stage);
  let texture_array_layers = format!("{}", limits.max_texture_array_layers);
  let compute_workgroup_size = format!(
    "{}x{}x{}",
    limits.max_compute_workgroup_size_x,
    limits.max_compute_workgroup_size_y,
    limits.max_compute_workgroup_size_z
  );
  let compute_invocations = format!("{}", limits.max_compute_invocations_per_workgroup);
  let compute_workgroups = format!("{}", limits.max_compute_workgroups_per_dimension);
  let compute_storage_size = format!("{} bytes", limits.max_compute_workgroup_storage_size);
  let buffer_size = format!("{:.2} MB", max_buffer_size_mb);
  let storage_buffers = format!("{}", limits.max_storage_buffers_per_shader_stage);
  let storage_buffer_binding_size = format!("{:.2} MB", max_storage_buffer_binding_size_mb);
  let bindings_per_group = format!("{}", limits.max_bindings_per_bind_group);
  let bind_groups = format!("{}", limits.max_bind_groups);

  let rows = vec![
    // Texture limits
    ("max_texture_dimension_3d", texture_dim_3d.as_str()),
    (
      "max_sampled_textures_per_shader_stage",
      sampled_textures.as_str(),
    ),
    (
      "max_storage_textures_per_shader_stage",
      storage_textures.as_str(),
    ),
    ("max_texture_array_layers", texture_array_layers.as_str()),
    // Compute shader limits
    (
      "max_compute_workgroup_size_x",
      compute_workgroup_size.as_str(),
    ),
    (
      "max_compute_invocations_per_workgroup",
      compute_invocations.as_str(),
    ),
    (
      "max_compute_workgroups_per_dimension",
      compute_workgroups.as_str(),
    ),
    (
      "max_compute_workgroup_storage_size",
      compute_storage_size.as_str(),
    ),
    // Buffer limits
    ("max_buffer_size", buffer_size.as_str()),
    (
      "max_storage_buffers_per_shader_stage",
      storage_buffers.as_str(),
    ),
    (
      "max_storage_buffer_binding_size",
      storage_buffer_binding_size.as_str(),
    ),
    // Binding limits
    ("max_bindings_per_bind_group", bindings_per_group.as_str()),
    ("max_bind_groups", bind_groups.as_str()),
  ];

  log_table("Device Limits", &rows);
}
