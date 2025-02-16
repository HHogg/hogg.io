use super::*;

#[test]
fn test_compare_coordinate() {
  assert_eq!(compare_coordinate(0.0, 0.001), Ordering::Equal);
  assert_ne!(compare_coordinate(0.0, 0.01), Ordering::Equal);
  assert_eq!(compare_coordinate(0.0, 0.0), Ordering::Equal);
}

#[test]
fn test_normalize_radian() {
  let neg: Fxx = -1.0;
  let zero: Fxx = 0.0;
  let pos: Fxx = 1.0;

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
