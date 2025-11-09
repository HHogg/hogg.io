use wasm_bindgen::{prelude::Closure, JsValue};

use crate::utils::set_timeout;

pub fn schedule_post_update(interval: u32) -> Result<(), JsValue> {
  let post_update_closure = Closure::once_into_js(move || {});

  set_timeout(post_update_closure, interval)
    .map_err(|e| JsValue::from_str(&format!("Failed to schedule post update: {e:?}")))?;

  Ok(())
}

// Storage for buffer and dimensions (for auto-start)
// thread_local! {
//   static SHARED_BUFFER: RefCell<Option<JsValue>> = RefCell::new(None);
//   static UPDATE_INTERVAL: RefCell<u32> = RefCell::new(30); // Default: update every 30 frames
// }

// // Periodically read pixels from compute texture and update SharedArrayBuffer
// fn update_shared_buffer_async(buffer: JsValue, width: u32, height: u32, frame: u32) {
//   // Get WebGL context
//   let gl = match GL_CONTEXT.with(|c| c.borrow().clone()) {
//     Some(gl) => gl,
//     None => {
//       log::error!("WebGL context not available for buffer update");
//       return;
//     }
//   };

//   // Get the current read buffer to read from
//   let current_read_buffer = CURRENT_READ_BUFFER.with(|b| *b.borrow());
//   let compute_framebuffer = match current_read_buffer {
//     BufferSide::A => COMPUTE_FRAMEBUFFER_A.with(|f| f.borrow().clone()),
//     BufferSide::B => COMPUTE_FRAMEBUFFER_B.with(|f| f.borrow().clone()),
//   };

//   gl.bind_framebuffer(
//     WebGl2RenderingContext::FRAMEBUFFER,
//     compute_framebuffer.as_ref(),
//   );

//   // Read pixels back from framebuffer
//   let mut pixels = vec![0u8; (width * height * 4) as usize];
//   if let Err(e) = gl.read_pixels_with_opt_u8_array(
//     0,
//     0,
//     width as i32,
//     height as i32,
//     WebGl2RenderingContext::RGBA,
//     WebGl2RenderingContext::UNSIGNED_BYTE,
//     Some(&mut pixels),
//   ) {
//     log::error!("Failed to read pixels: {:?}", e);
//     state::set_is_reading(false);
//     return;
//   }

//   // Convert SharedArrayBuffer to Uint8Array
//   let uint8_array = Uint8Array::new(&buffer);
//   let mut buffer_slice = vec![0u8; uint8_array.length() as usize];
//   uint8_array.copy_to(&mut buffer_slice);

//   // Copy pixels to buffer (flip Y axis since OpenGL reads bottom-to-top)
//   for y in 0..height {
//     let src_y = (height - 1 - y) as usize;
//     for x in 0..width {
//       let src_idx = (src_y * width as usize + x as usize) * 4;
//       let dst_idx = (y * width + x) as usize * 4;

//       if dst_idx + 3 < buffer_slice.len() {
//         buffer_slice[dst_idx] = pixels[src_idx];
//         buffer_slice[dst_idx + 1] = pixels[src_idx + 1];
//         buffer_slice[dst_idx + 2] = pixels[src_idx + 2];
//         buffer_slice[dst_idx + 3] = pixels[src_idx + 3];
//       }
//     }
//   }

//   // Copy back to SharedArrayBuffer
//   uint8_array.copy_from(&buffer_slice);

//   // Mark reading as complete
//   state::set_is_reading(false);

//   // Post message to main thread using DedicatedWorkerGlobalScope
//   let message = js_sys::Object::new();
//   js_sys::Reflect::set(&message, &"type".into(), &"bufferUpdated".into()).unwrap();
//   js_sys::Reflect::set(&message, &"frame".into(), &(frame as f64).into()).unwrap();
//   js_sys::Reflect::set(&message, &"timestamp".into(), &js_sys::Date::now().into()).unwrap();

//   // Get worker global scope and post message
//   if let Ok(worker_global) = js_sys::global().dyn_into::<DedicatedWorkerGlobalScope>() {
//     let _ = worker_global.post_message(&message).map_err(|e| {
//       log::error!("Failed to post message: {:?}", e);
//     });
//   } else {
//     log::warn!("Not in a worker context, cannot post message");
//   }

//   log::debug!("SharedArrayBuffer updated at frame {}", frame);
// }

//  // Periodically update SharedArrayBuffer (non-blocking)
//  let update_interval = UPDATE_INTERVAL.with(|i| *i.borrow());
//  if state.frame_count % update_interval == 0 && !state.is_reading {
//    state::set_is_reading(true);

//    // Defer readPixels to avoid blocking the render loop
//    // Use setTimeout for this async operation (not part of render loop)
//    let buffer_clone = buffer.clone();
//    let width_clone = width;
//    let height_clone = height;
//    let frame_clone = state.frame_count;

//    // let read_closure = Closure::once_into_js(move || {
//    //   update_shared_buffer_async(buffer_clone, width_clone, height_clone, frame_clone);
//    // });

//    // Get worker again for setTimeout (not moved into closure)
//    // let worker_for_timeout: DedicatedWorkerGlobalScope = js_sys::global().dyn_into().unwrap();
//    // let _timeout_id = worker_for_timeout
//    //   .set_timeout_with_callback_and_timeout_and_arguments_0(
//    //     read_closure.as_ref().unchecked_ref(),
//    //     0,
//    //   )
//    //   .unwrap_or_else(|e| {
//    //     log::error!("Failed to schedule buffer update: {:?}", e);
//    //     state::set_is_reading(false);
//    //     -1i32
//    //   });
//  }
