use wasm_bindgen::{prelude::Closure, JsValue};

use crate::post_message::Message;
use crate::sim;
use crate::utils::set_timeout;

pub fn schedule_post_update(interval: u32, stats: sim::program::RunStats) -> Result<(), JsValue> {
  let post_update_closure = Closure::once_into_js(move || {
    Message::SimulationRunStats(stats).send();
  });

  set_timeout(post_update_closure, interval)
    .map_err(|e| JsValue::from_str(&format!("Failed to schedule post update: {e:?}")))?;

  Ok(())
}
