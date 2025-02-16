use hogg_spatial_grid_map::utils::PI;
use insta::assert_json_snapshot;

use super::*;

#[test]
fn is_between_radians_is_true_when_a_lt_b_lt_c() {
  assert!(is_between_radians(0.0, 1.0, 2.0));
}

#[test]
fn is_between_radians_is_false_when_a_gt_b_lt_c() {
  assert!(!is_between_radians(1.0, 0.0, 2.0));
}

#[test]
fn is_between_radians_is_false_when_a_lt_b_gt_c() {
  assert!(!is_between_radians(1.0, 3.0, 2.0));
}

#[test]
fn is_between_radians_is_true_when_c_wraps_0_and_b_is_lt_pi_2() {
  assert!(is_between_radians(PI * 1.5, PI * 1.75, PI * 0.5));
}

#[test]
fn is_between_radians_is_true_when_c_wraps_0_and_b_is_gt_0() {
  assert!(is_between_radians(PI * 1.5, PI * 0.25, PI * 0.5));
}

#[test]
fn creates_an_empty_convex_hull_from_0_line_segments() {
  // 0 line_segments
  assert_json_snapshot!(ConvexHull::from_line_segments([].iter()));
}

#[test]
fn creates_an_empty_convex_hull_from_1_line_segments() {
  // 1 line_segment
  assert_json_snapshot!(ConvexHull::from_line_segments(
    [LineSegment::default()].iter()
  ));
}

#[test]
fn creates_an_empty_convex_hull_from_2_line_segments() {
  // 2 line_segments
  assert_json_snapshot!(ConvexHull::from_line_segments(
    [LineSegment::default(), LineSegment::default()].iter()
  ));
}
