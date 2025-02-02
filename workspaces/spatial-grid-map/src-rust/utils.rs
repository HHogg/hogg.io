#[path = "./utils_tests.rs"]
#[cfg(test)]
mod tests;

use std::cmp::Ordering;
use std::f32::consts::PI;

const TOLERANCE_RADIAN: f32 = 0.0001;
const TOLERANCE_COORDINATE: f32 = 0.001;

fn compare_f32(a: f32, b: f32, precision: f32) -> Ordering {
  if (a - b).abs() <= precision + f32::EPSILON {
    return Ordering::Equal;
  }

  a.partial_cmp(&b).unwrap()
}

pub fn compare_coordinate(a: f32, b: f32) -> std::cmp::Ordering {
  compare_f32(a, b, TOLERANCE_COORDINATE)
}

pub fn coordinate_equals(a: f32, b: f32) -> bool {
  compare_coordinate(a, b) == Ordering::Equal
}

pub fn radians_equal(a: f32, b: f32) -> bool {
  compare_f32(a, b, TOLERANCE_RADIAN) == Ordering::Equal
}

pub fn normalize_radian(mut radian: f32) -> f32 {
  radian += PI * 0.5;

  if radian < -TOLERANCE_RADIAN {
    radian += PI * 2.0;
  }

  radian
}

pub fn get_radians_for_x_y(x: f32, y: f32) -> f32 {
  if coordinate_equals(x, 0.0) && coordinate_equals(y, 0.0) {
    return 0.0;
  }

  normalize_radian(y.atan2(x))
}
