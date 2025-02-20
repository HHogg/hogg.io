#[path = "./utils_tests.rs"]
#[cfg(test)]
mod tests;

use std::cmp::Ordering;

use typeshare::typeshare;

#[typeshare]
pub type Fxx = f64;

pub const PI: Fxx = std::f64::consts::PI;
pub const PI_FRAC2: Fxx = PI * 0.5;
pub const PI2: Fxx = PI * 2.0;

pub const TOLERANCE_RADIAN: Fxx = 0.0001;
pub const TOLERANCE_COORDINATE: Fxx = 0.001;

fn compare_fxx(a: Fxx, b: Fxx, precision: Fxx) -> Ordering {
  if (a - b).abs() <= precision + Fxx::EPSILON {
    return Ordering::Equal;
  }

  a.partial_cmp(&b).unwrap()
}

pub fn compare_coordinate(a: Fxx, b: Fxx) -> std::cmp::Ordering {
  compare_fxx(a, b, TOLERANCE_COORDINATE)
}

pub fn coordinate_equals(a: Fxx, b: Fxx) -> bool {
  compare_coordinate(a, b) == Ordering::Equal
}

pub fn radians_equal(a: Fxx, b: Fxx) -> bool {
  (compare_fxx(a, 0.0, TOLERANCE_RADIAN) == Ordering::Equal
    && compare_fxx(b, PI2, TOLERANCE_RADIAN) == Ordering::Equal)
    || (compare_fxx(b, 0.0, TOLERANCE_RADIAN) == Ordering::Equal
      && compare_fxx(a, PI2, TOLERANCE_RADIAN) == Ordering::Equal)
    || compare_fxx(a, b, TOLERANCE_RADIAN) == Ordering::Equal
}

pub fn normalize_radian(mut radian: Fxx) -> Fxx {
  radian += PI_FRAC2;

  if radian < -TOLERANCE_RADIAN {
    radian += PI2;
  }

  radian
}

pub fn get_radians_for_x_y(x: Fxx, y: Fxx) -> Fxx {
  if coordinate_equals(x, 0.0) && coordinate_equals(y, 0.0) {
    return 0.0;
  }

  normalize_radian(y.atan2(x))
}
