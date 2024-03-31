use super::*;

#[test]
fn test_compare_coordinate() {
  assert_eq!(compare_coordinate(0.0, 0.001), Ordering::Equal);
  assert_ne!(compare_coordinate(0.0, 0.01), Ordering::Equal);
  assert_eq!(compare_coordinate(0.0, 0.0), Ordering::Equal);
}

#[test]
fn test_compare_radians() {
  assert_eq!(compare_radians(0.0, 0.0001), Ordering::Equal);
  assert_ne!(compare_radians(0.0, 0.001), Ordering::Equal);
  assert_ne!(compare_radians(0.0, 0.01), Ordering::Equal);
  assert_eq!(compare_radians(0.0, 0.0), Ordering::Equal);
}

#[test]
fn test_round_coordinate() {
  let tests = vec![
    (6.661338147750939e-16, -4.440892098500626e-16),
    (-1.7320508075688774, -1.7320508075688772),
    (-2.884444029575346e-16, 2.884444029575346e-16),
    (-1.6653345369377358e-16, 1.6653345369377353e-16),
    (1.5000000000000004, 1.5),
    (-0.8660254037844375, -0.8660254037844386),
    (-2.8844440295753455e-16, 2.884444029575345e-16),
    (1.6653345369377348e-16, -1.6653345369377365e-16),
    (-1.5000000000000004, -1.5000000000000002),
    (-0.8660254037844378, -0.8660254037844379),
    (-2.884444029575344e-16, 2.884444029575346e-16),
    (1.6653345369377368e-16, -1.6653345369377348e-16),
    (-5.551115123125783e-16, -3.3306690738754696e-16),
    (-1.7320508075688767, -1.7320508075688774),
    (-0.0, 0.0),
  ];

  for (a, b) in tests {
    assert_eq!(
      round_coordinate(a).to_string(),
      round_coordinate(b).to_string()
    );
  }

  let tests = vec![(0.5, 0.6)];

  for (a, b) in tests {
    assert_ne!(
      round_coordinate(a).to_string(),
      round_coordinate(b).to_string()
    );
  }
}

#[test]
fn test_normalize_radian() {
  let neg: f64 = -1.0;
  let zero: f64 = 0.0;
  let pos: f64 = 1.0;

  // atan2
  assert!((neg.atan2(zero) - PI * -0.5).abs() < PRECISION_RADIAN);
  assert!((neg.atan2(pos) - PI * -0.25).abs() < PRECISION_RADIAN);
  assert!((zero.atan2(pos) - PI * 0.0).abs() < PRECISION_RADIAN);
  assert!((pos.atan2(pos) - PI * 0.25).abs() < PRECISION_RADIAN);
  assert!((pos.atan2(zero) - PI * 0.5).abs() < PRECISION_RADIAN);
  assert!((pos.atan2(neg) - PI * 0.75).abs() < PRECISION_RADIAN);
  assert!((zero.atan2(neg) - PI * 1.0).abs() < PRECISION_RADIAN);
  assert!((neg.atan2(neg) - PI * -0.75).abs() < PRECISION_RADIAN);

  // normalize_radian
  assert!((normalize_radian(neg.atan2(zero)) - PI * 0.0).abs() < PRECISION_RADIAN);
  assert!((normalize_radian(neg.atan2(pos)) - PI * 0.25).abs() < PRECISION_RADIAN);
  assert!((normalize_radian(zero.atan2(pos)) - PI * 0.5).abs() < PRECISION_RADIAN);
  assert!((normalize_radian(pos.atan2(pos)) - PI * 0.75).abs() < PRECISION_RADIAN);
  assert!((normalize_radian(pos.atan2(zero)) - PI * 1.0).abs() < PRECISION_RADIAN);
  assert!((normalize_radian(pos.atan2(neg)) - PI * 1.25).abs() < PRECISION_RADIAN);
  assert!((normalize_radian(zero.atan2(neg)) - PI * 1.5).abs() < PRECISION_RADIAN);
  assert!((normalize_radian(neg.atan2(neg)) - PI * 1.75).abs() < PRECISION_RADIAN);
}

#[test]
fn test_radian_to_degrees() {
  assert_eq!(radian_to_degrees(PI), 180);
  assert_eq!(radian_to_degrees(PI / 2.0), 90);
  assert_eq!(radian_to_degrees(PI / 4.0), 45);
  assert_eq!(radian_to_degrees(PI / 6.0), 30);
}
