#[path = "./utils_tests.rs"]
#[cfg(test)]
mod tests;

use std::cmp::Ordering;
use std::f32::consts::PI;

const PRECISION_RADIAN: f32 = 0.0001;
const PRECISION_COORDINATE: f32 = 0.001;

pub fn compare_f32(a: f32, b: f32, precision: f32) -> Ordering {
  if (a - b).abs() <= precision + f32::EPSILON {
    return Ordering::Equal;
  }

  a.partial_cmp(&b).unwrap()
}

pub fn compare_radians(a: f32, b: f32) -> std::cmp::Ordering {
  compare_f32(a, b, PRECISION_RADIAN)
}

/// Returns true if a <= b <= c. This assumes that
/// we're always working with normalized radians (0.0 to 2PI)
/// and that a and c are clockwise.
///
/// It handles cases where a <= PI * 2.0 and c >= 0.0
pub fn is_between_radians(a: f32, b: f32, c: f32) -> bool {
  let ab_comp = compare_radians(a, b);
  let bc_comp = compare_radians(b, c);

  if compare_radians(a, c) == Ordering::Greater {
    return ab_comp == Ordering::Less || bc_comp == Ordering::Less;
  }

  ab_comp == Ordering::Equal
    || bc_comp == Ordering::Equal
    || (ab_comp == Ordering::Less && bc_comp == Ordering::Less)
}

pub fn compare_coordinate(a: f32, b: f32) -> std::cmp::Ordering {
  compare_f32(a, b, PRECISION_COORDINATE)
}

pub fn coordinate_equals(a: f32, b: f32) -> bool {
  compare_coordinate(a, b) == Ordering::Equal
}

pub fn round_coordinate(coordinate: f32) -> f32 {
  let rounded = ((coordinate + f32::EPSILON) / PRECISION_COORDINATE).round() * PRECISION_COORDINATE;

  // Even though -0.0 == 0.0, we want to return 0.0
  // to avoid issues with hashing
  if rounded == -0.0 {
    return 0.0;
  }

  rounded
}

pub fn radian_to_degrees(radian: f32) -> u16 {
  (((radian * 180.0 / PI) * 10.0).round() / 10.0) as u16
}

pub fn degrees_to_radian(degrees: u16) -> f32 {
  degrees as f32 * PI / 180.0
}

pub fn normalize_radian(mut radian: f32) -> f32 {
  radian += PI * 0.5;

  if radian < -PRECISION_RADIAN {
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
