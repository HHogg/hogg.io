use core::f32;
use std::f32::consts::PI;

use insta::assert_json_snapshot;

use crate::{geometry::Polygon, notation::Shape};

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

#[test]
fn orders_points_correctly_from_triangle_line_segments() {
  let polygon = Polygon::default().with_shape(Shape::Triangle).at_center();
  let convex_hull = ConvexHull::from_line_segments(polygon.line_segments.iter());

  assert_json_snapshot!(convex_hull, {
    ".points[].*" => insta::rounded_redaction(5)
  });
}

#[test]
fn orders_points_correctly_from_square_line_segments() {
  let polygon = Polygon::default().with_shape(Shape::Square).at_center();
  let convex_hull = ConvexHull::from_line_segments(polygon.line_segments.iter());

  assert_json_snapshot!(convex_hull, {
    ".points[].*" => insta::rounded_redaction(5)
  });
}

#[test]
fn orders_points_correctly_from_hexagon_line_segments() {
  let polygon = Polygon::default().with_shape(Shape::Hexagon).at_center();
  let convex_hull = ConvexHull::from_line_segments(polygon.line_segments.iter());

  assert_json_snapshot!(convex_hull, {
    ".points[].*" => insta::rounded_redaction(5)
  });
}

#[test]
fn orders_points_correctly_from_octagon_line_segments() {
  let polygon = Polygon::default().with_shape(Shape::Hexagon).at_center();
  let convex_hull = ConvexHull::from_line_segments(polygon.line_segments.iter());

  assert_json_snapshot!(convex_hull, {
    ".points[].*" => insta::rounded_redaction(5)
  });
}

#[test]
fn orders_points_correctly_from_dodecagon_line_segments() {
  let polygon = Polygon::default().with_shape(Shape::Dodecagon).at_center();
  let convex_hull = ConvexHull::from_line_segments(polygon.line_segments.iter());

  assert_json_snapshot!(convex_hull, {
    ".points[].*" => insta::rounded_redaction(5)
  });
}

#[test]
fn finds_line_segments_for_vector_terminal_points_top() {
  // Lets use a square which is drawn with a rotation that means
  // it's sides are flat along the top and bottom.
  let polygon = Polygon::default().with_shape(Shape::Square).at_center();
  let convex_hull = ConvexHull::from_line_segments(polygon.line_segments.iter());
  let line_segment = convex_hull.find_line_segment(Point::default().with_x(0.0).with_y(1.0));

  assert_json_snapshot!(line_segment, {
    ".*" => insta::rounded_redaction(5)
  });
}

#[test]
fn finds_line_segments_for_vector_terminal_points_right() {
  let polygon = Polygon::default().with_shape(Shape::Square).at_center();
  let convex_hull = ConvexHull::from_line_segments(polygon.line_segments.iter());
  let line_segment = convex_hull.find_line_segment(
    Point::default()
      .with_x(0.0)
      .with_y(-1.0)
      .rotate(f32::consts::PI * 0.5, None),
  );

  assert_json_snapshot!(line_segment, {
    ".*" => insta::rounded_redaction(5)
  });
}

#[test]
fn finds_line_segments_for_vector_terminal_points_bottom() {
  let polygon = Polygon::default().with_shape(Shape::Square).at_center();
  let convex_hull = ConvexHull::from_line_segments(polygon.line_segments.iter());
  let line_segment = convex_hull.find_line_segment(
    Point::default()
      .with_x(0.0)
      .with_y(-1.0)
      .rotate(f32::consts::PI, None),
  );

  assert_json_snapshot!(line_segment, {
    ".*" => insta::rounded_redaction(5)
  });
}

#[test]
fn finds_line_segments_for_vector_terminal_points_left() {
  let polygon = Polygon::default().with_shape(Shape::Square).at_center();
  let convex_hull = ConvexHull::from_line_segments(polygon.line_segments.iter());
  let line_segment = convex_hull.find_line_segment(
    Point::default()
      .with_x(0.0)
      .with_y(-1.0)
      .rotate(f32::consts::PI * 1.5, None),
  );

  assert_json_snapshot!(line_segment, {
    ".*" => insta::rounded_redaction(5)
  });
}
