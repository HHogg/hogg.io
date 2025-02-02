use std::collections::HashMap;

use chrono::Utc;
use serde::{Deserialize, Serialize};
use typeshare::typeshare;

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Metrics {
  events: Vec<Event>,
  events_pending: HashMap<String, Event>,
}

impl Metrics {
  pub fn create(&mut self, key: &str) {
    self.events_pending.insert(
      key.into(),
      Event {
        key: key.into(),
        time_started: None,
        counters: HashMap::new(),
        duration: 0,
      },
    );
  }

  pub fn start(&mut self, key: &str) {
    self.create(key);
    self.resume(key);
  }

  pub fn resume(&mut self, key: &str) {
    let event = self
      .events_pending
      .get_mut(key)
      .expect("No Metrics event to resume. Start a new event first.");

    event.time_started = Some(Utc::now().timestamp_millis());
  }

  pub fn is_started(&self, key: &str) -> bool {
    self
      .events_pending
      .get(key)
      .map_or(false, |event| event.time_started.is_some())
  }

  pub fn pause(&mut self, key: &str) {
    let event = self
      .events_pending
      .get_mut(key)
      .expect("No Metrics event to pause. Start a new event first.");

    let time_started = event
      .time_started
      .expect("Metric event has already been paused or was never started.");

    let time_ended = Utc::now().timestamp_millis();
    let duration = (time_ended - time_started).max(0);

    event.duration += duration as u32;
  }

  pub fn finish(&mut self, key: &str) {
    if self.is_started(key) {
      self.pause(key);
    }

    let event = self
      .events_pending
      .remove(key)
      .expect("No Metrics event to finish. Start a new event first.");

    self.events.push(event);
  }

  pub fn increment(&mut self, key: &str, counter: &str) {
    let event = self
      .events_pending
      .get_mut(key)
      .or_else(|| self.events.last_mut())
      .expect("No Metrics event to increment. Start a new event first.");

    let counter = event.counters.entry(counter.to_string()).or_insert(0);
    *counter += 1;
  }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Event {
  key: String,
  #[serde(skip)]
  time_started: Option<i64>,
  #[typeshare(serialized_as = "Map<String, u32>")]
  counters: HashMap<String, u32>,
  duration: u32,
}
