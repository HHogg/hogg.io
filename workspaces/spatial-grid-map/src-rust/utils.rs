use std::cmp::Ordering;

const PRECISION_COORDINATE: f64 = 0.0001525;

pub fn compare_f64(a: f64, b: f64, precision: f64) -> Ordering {
  if (a - b).abs() <= precision + f64::EPSILON {
    return Ordering::Equal;
  }

  a.partial_cmp(&b).unwrap()
}

pub fn compare_coordinate(a: f64, b: f64) -> std::cmp::Ordering {
  compare_f64(a, b, PRECISION_COORDINATE)
}

pub fn coordinate_equals(a: f64, b: f64) -> bool {
  compare_coordinate(a, b) == Ordering::Equal
}
