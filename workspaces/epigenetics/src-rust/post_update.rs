use wasm_bindgen::{prelude::Closure, JsValue};

use crate::utils::set_timeout;

pub fn schedule_post_update(interval: u32) -> Result<(), JsValue> {
  let post_update_closure = Closure::once_into_js(move || {});

  set_timeout(post_update_closure, interval)
    .map_err(|e| JsValue::from_str(&format!("Failed to schedule post update: {e:?}")))?;

  Ok(())
}
