use std::collections::HashMap;

use super::*;

use insta::assert_debug_snapshot;
use rand::seq::SliceRandom;

#[test]
fn center() {
  assert_debug_snapshot!(Location::new(2, 1.0, Point(0.0, 0.0)));
}

#[test]
fn top() {
  assert_debug_snapshot!(Location::new(2, 1.0, Point(0.0, -7.5)));
}

#[test]
fn top_right() {
  assert_debug_snapshot!(Location::new(2, 1.0, Point(7.5, -7.5)));
}

#[test]
fn right() {
  assert_debug_snapshot!(Location::new(2, 1.0, Point(7.5, 0.0)));
}

#[test]
fn bottom_right() {
  assert_debug_snapshot!(Location::new(2, 1.0, Point(7.5, 7.5)));
}

#[test]
fn bottom() {
  assert_debug_snapshot!(Location::new(2, 1.0, Point(0.0, 7.5)));
}

#[test]
fn bottom_left() {
  assert_debug_snapshot!(Location::new(2, 1.0, Point(-7.5, 7.5)));
}

#[test]
fn left() {
  assert_debug_snapshot!(Location::new(2, 1.0, Point(-7.5, 0.0)));
}

#[test]
fn top_left() {
  assert_debug_snapshot!(Location::new(2, 1.0, Point(-7.5, -7.5)));
}

#[test]
fn snap_x_just_under() {
  assert_debug_snapshot!(Location::new(2, 1.0, Point(7.0 - TOLERANCE * 0.5, 7.0)));
}

#[test]
fn snap_y_just_under() {
  assert_debug_snapshot!(Location::new(2, 1.0, Point(7.0, 7.0 - TOLERANCE * 0.5)));
}

#[test]
fn top_oob() {
  assert_debug_snapshot!(Location::new(2, 1.0, Point(0.0, -8.1)));
}

#[test]
fn right_oob() {
  assert_debug_snapshot!(Location::new(2, 1.0, Point(8.0, 0.0)));
}

#[test]
fn bottom_oob() {
  assert_debug_snapshot!(Location::new(2, 1.0, Point(0.0, 8.0)));
}

#[test]
fn left_oob() {
  assert_debug_snapshot!(Location::new(2, 1.0, Point(-8.1, 0.0)));
}

fn get_sorted_location_ids(locations: Vec<(&str, Location)>) -> Vec<&str> {
  let locations_map_by_id: HashMap<&str, Location> = locations.iter().cloned().collect();

  let locations_map_by_key: HashMap<(i64, i64), &str> = locations_map_by_id
    .iter()
    .map(|(id, location)| (location.key, *id))
    .collect();

  let mut locations = locations_map_by_id.values().collect::<Vec<_>>();

  // Lets just make sure it's not in order first.
  locations.shuffle(&mut rand::thread_rng());

  // The actual logic we're testing here.
  locations.sort_by(|a, b| a.partial_cmp(b).unwrap());

  let sorted_locations_ids: Vec<_> = locations
    .iter()
    .map(|location| locations_map_by_key[&location.key])
    .collect();

  sorted_locations_ids
}

#[test]
fn order_radians() {
  assert_debug_snapshot!(get_sorted_location_ids(vec![
    ("top", Location::new(2, 1.0, Point(0.0, -7.5))),
    ("top-right", Location::new(2, 1.0, Point(7.5, -7.5))),
    ("right", Location::new(2, 1.0, Point(7.5, 0.0))),
    ("bottom-right", Location::new(2, 1.0, Point(7.5, 7.5))),
    ("bottom", Location::new(2, 1.0, Point(0.0, 7.5))),
    ("bottom-left", Location::new(2, 1.0, Point(-7.5, 7.5))),
    ("left", Location::new(2, 1.0, Point(-7.5, 0.0))),
    ("top-left", Location::new(2, 1.0, Point(-7.5, -7.5))),
  ]));
}

#[test]
fn order_distance() {
  assert_debug_snapshot!(get_sorted_location_ids(vec![
    ("center", Location::new(2, 1.0, Point(0.0, 0.0))),
    ("top", Location::new(2, 1.0, Point(0.0, -7.5))),
    ("top-right", Location::new(2, 1.0, Point(7.5, -7.5))),
  ]));
}
