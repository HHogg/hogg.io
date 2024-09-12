#[path = "./utils_tests.rs"]
#[cfg(test)]
mod tests;

use std::cmp::Ordering;
use std::f64::consts::PI;

const PRECISION_RADIAN: f64 = 0.0001;
const PRECISION_COORDINATE: f64 = 0.001;

pub fn compare_f64(a: f64, b: f64, precision: f64) -> Ordering {
  if (a - b).abs() <= precision + f64::EPSILON {
    return Ordering::Equal;
  }

  a.partial_cmp(&b).unwrap()
}

pub fn compare_radians(a: f64, b: f64) -> std::cmp::Ordering {
  compare_f64(a, b, PRECISION_RADIAN)
}

pub fn compare_coordinate(a: f64, b: f64) -> std::cmp::Ordering {
  compare_f64(a, b, PRECISION_COORDINATE)
}

pub fn coordinate_equals(a: f64, b: f64) -> bool {
  compare_coordinate(a, b) == Ordering::Equal
}

pub fn round_coordinate(coordinate: f64) -> f64 {
  let rounded = ((coordinate + f64::EPSILON) / PRECISION_COORDINATE).round() * PRECISION_COORDINATE;

  // Even though -0.0 == 0.0, we want to return 0.0
  // to avoid issues with hashing
  if rounded == -0.0 {
    return 0.0;
  }

  rounded
}

pub fn radian_to_degrees(radian: f64) -> u16 {
  (((radian * 180.0 / PI) * 10.0).round() / 10.0) as u16
}

pub fn degrees_to_radian(degrees: u16) -> f64 {
  degrees as f64 * PI / 180.0
}

pub fn normalize_radian(mut radian: f64) -> f64 {
  radian += PI * 0.5;

  if radian < -PRECISION_RADIAN {
    radian += PI * 2.0;
  }

  radian
}

pub fn get_radians_for_x_y(x: f64, y: f64) -> f64 {
  if coordinate_equals(x, 0.0) && coordinate_equals(y, 0.0) {
    return 0.0;
  }

  normalize_radian(y.atan2(x))
}
