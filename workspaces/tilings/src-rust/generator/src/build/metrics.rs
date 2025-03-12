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
  events_recording: Vec<String>,
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

  pub fn finish(&mut self, key: &str) {
    if self.has_started(key) {
      self.pause(key);
    }

    let event = self.events_pending.remove(key).unwrap_or_else(|| {
      panic!(
        "No Metrics event to finish. Start a new event first ({})",
        key
      )
    });

    self.events.push(event);
  }

  pub fn resume(&mut self, key: &str) {
    self.pause_last_event_recording();
    self.resume_event_recording(key);
    self.events_recording.push(key.to_string());
  }

  fn resume_event_recording(&mut self, key: &str) {
    let event = self.events_pending.get_mut(key).unwrap_or_else(|| {
      panic!(
        "No Metrics event to resume. Start a new event first ({}).",
        key
      )
    });

    event.time_started = Some(Utc::now().timestamp_millis());
  }

  fn resume_last_event_recording(&mut self) {
    if let Some(last_key) = self.events_recording.last().cloned() {
      if last_key != "build" {
        self.resume_event_recording(last_key.as_str());
      }
    }
  }

  pub fn pause(&mut self, key: &str) {
    self.pause_event_recording(key);

    if let Some(last_key) = self.events_recording.pop() {
      if last_key != *key {
        panic!(
          "Metric '{}' was not the last in the recording, got '{}'.",
          key, last_key
        );
      }

      self.resume_last_event_recording();
    } else {
      panic!(
        "No Metrics event to pause. Start a new event first ({}).",
        key
      );
    }
  }

  fn pause_event_recording(&mut self, key: &str) {
    let event = self.events_pending.get_mut(key).unwrap_or_else(|| {
      panic!(
        "No Metrics event to pause. Start a new event first ({}).",
        key
      )
    });

    let time_started = event
      .time_started
      .expect("Metric event has already been paused or was never started.");

    let time_ended = Utc::now().timestamp_millis();
    let duration = (time_ended - time_started).max(0);

    event.time_started = None;
    event.duration += duration as u32;
  }

  fn pause_last_event_recording(&mut self) {
    if let Some(last_key) = self.events_recording.last().cloned() {
      if last_key != "build" {
        self.pause_event_recording(last_key.as_str());
      }
    }
  }

  pub fn increment(&mut self, key: &str, counter: &str) {
    let event = self
      .events_pending
      .get_mut(key)
      .or_else(|| self.events.last_mut())
      .unwrap_or_else(|| {
        panic!(
          "No Metrics event to increment. Start a new event first ({}).",
          key
        )
      });

    let counter = event.counters.entry(counter.to_string()).or_insert(0);
    *counter += 1;
  }

  fn has_started(&self, key: &str) -> bool {
    self
      .events_pending
      .get(key)
      .is_some_and(|event| event.time_started.is_some())
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
