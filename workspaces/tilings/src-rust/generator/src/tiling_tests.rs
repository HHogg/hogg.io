use std::sync::{LazyLock, Mutex, Once};

use chrono::Utc;
use insta::assert_debug_snapshot;

use super::*;

static BEFORE_EACH: Once = Once::new();

static FIRST_VALID_LEVEL_2_TILING_INDEX: u16 = 71;
static FIRST_VALID_LEVEL_2_TILING_TARGET_DURATION_MS: i64 = 3000;
static FIRST_VALID_LEVEL_2_TILING_TARGET_TOLERANCE_MS: LazyLock<i64> = LazyLock::new(|| {
  if std::env::var("CI").is_ok() {
    1000
  } else {
    250
  }
});

static FIRST_VALID_LEVEL_2_DURATION_MS: Mutex<i64> = Mutex::new(0);
static FIRST_VALID_LEVEL_2_TILINGS: Mutex<Vec<String>> = Mutex::new(vec![]);

pub fn before_each() {
  BEFORE_EACH.call_once(|| {
    let time_started = Utc::now().timestamp_millis();

    let mut tiling = Tiling::default()
      .with_feature_toggles(Some(FeatureToggle::all()))
      .with_repetitions(5)
      .with_link_paths()
      .with_first_transform();

    let results: Vec<String> = (0..FIRST_VALID_LEVEL_2_TILING_INDEX)
      .filter_map(|_| {
        tiling
          .find_next_tiling(None)
          .ok()
          .flatten()
          .map(|r| r.notation.to_string())
      })
      .collect();

    let time_ended = Utc::now().timestamp_millis();
    let duration = (time_ended - time_started).max(0);

    {
      *FIRST_VALID_LEVEL_2_TILINGS.lock().unwrap() = results;
      *FIRST_VALID_LEVEL_2_DURATION_MS.lock().unwrap() = duration;
    }
  });
}

#[test]
fn first_valid_level_1_to_2_tilings_are_correct() {
  before_each();
  assert_debug_snapshot!(FIRST_VALID_LEVEL_2_TILINGS.lock().unwrap());
}

#[test]
fn first_valid_level_1_to_2_generate_in_an_acceptable_time() {
  before_each();
  let duration = *FIRST_VALID_LEVEL_2_DURATION_MS.lock().unwrap();
  let target =
    FIRST_VALID_LEVEL_2_TILING_TARGET_DURATION_MS + *FIRST_VALID_LEVEL_2_TILING_TARGET_TOLERANCE_MS;

  assert!(
    duration <= target,
    "Finding first {} valid tilings took too long ({}ms)",
    FIRST_VALID_LEVEL_2_TILING_INDEX,
    duration
  );
}

#[test]
fn traversing_from_level_2_to_1_tilings_match_level_1_to_2() {
  before_each();

  let tilings = FIRST_VALID_LEVEL_2_TILINGS.lock().unwrap();
  let first_level_2_tiling = tilings.last().unwrap();

  let mut tiling = Tiling::default()
    .with_feature_toggles(Some(FeatureToggle::all()))
    .with_repetitions(5)
    .with_link_paths()
    .with_first_transform()
    .from_string(first_level_2_tiling);

  tiling.find_next_tiling(None).unwrap();

  let mut results: Vec<String> = (0..FIRST_VALID_LEVEL_2_TILING_INDEX)
    .filter_map(|_| {
      tiling
        .find_previous_tiling(None)
        .ok()
        .flatten()
        .map(|r| r.notation.to_string())
    })
    .collect();

  results.reverse();

  assert_eq!(*tilings, results);
}
