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
    (6.661_338e-16, -4.440_892e-16),
    (-1.732_050_8, -1.732_050_8),
    (-2.884_444e-16, 2.884_444e-16),
    (-1.665_334_5e-16, 1.665_334_5e-16),
    (1.5, 1.5),
    (-0.866_025_4, -0.866_025_4),
    (-2.884_444e-16, 2.884_444e-16),
    (1.665_334_5e-16, -1.665_334_5e-16),
    (-1.5, -1.5),
    (-0.866_025_4, -0.866_025_4),
    (-2.884_444e-16, 2.884_444e-16),
    (1.665_334_5e-16, -1.665_334_5e-16),
    (-5.551_115e-16, -3.330_669e-16),
    (-1.732_050_8, -1.732_050_8),
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
  let neg: f32 = -1.0;
  let zero: f32 = 0.0;
  let pos: f32 = 1.0;

  // atan2
  assert!((neg.atan2(zero) - PI * -0.5).abs() < TOLERANCE_RADIAN);
  assert!((neg.atan2(pos) - PI * -0.25).abs() < TOLERANCE_RADIAN);
  assert!((zero.atan2(pos) - PI * 0.0).abs() < TOLERANCE_RADIAN);
  assert!((pos.atan2(pos) - PI * 0.25).abs() < TOLERANCE_RADIAN);
  assert!((pos.atan2(zero) - PI * 0.5).abs() < TOLERANCE_RADIAN);
  assert!((pos.atan2(neg) - PI * 0.75).abs() < TOLERANCE_RADIAN);
  assert!((zero.atan2(neg) - PI * 1.0).abs() < TOLERANCE_RADIAN);
  assert!((neg.atan2(neg) - PI * -0.75).abs() < TOLERANCE_RADIAN);

  // normalize_radian
  assert!((normalize_radian(neg.atan2(zero)) - PI * 0.0).abs() < TOLERANCE_RADIAN);
  assert!((normalize_radian(neg.atan2(pos)) - PI * 0.25).abs() < TOLERANCE_RADIAN);
  assert!((normalize_radian(zero.atan2(pos)) - PI * 0.5).abs() < TOLERANCE_RADIAN);
  assert!((normalize_radian(pos.atan2(pos)) - PI * 0.75).abs() < TOLERANCE_RADIAN);
  assert!((normalize_radian(pos.atan2(zero)) - PI * 1.0).abs() < TOLERANCE_RADIAN);
  assert!((normalize_radian(pos.atan2(neg)) - PI * 1.25).abs() < TOLERANCE_RADIAN);
  assert!((normalize_radian(zero.atan2(neg)) - PI * 1.5).abs() < TOLERANCE_RADIAN);
  assert!((normalize_radian(neg.atan2(neg)) - PI * 1.75).abs() < TOLERANCE_RADIAN);
}

#[test]
fn test_radian_to_degrees() {
  assert_eq!(radian_to_degrees(PI), 180);
  assert_eq!(radian_to_degrees(PI / 2.0), 90);
  assert_eq!(radian_to_degrees(PI / 4.0), 45);
  assert_eq!(radian_to_degrees(PI / 6.0), 30);
}
