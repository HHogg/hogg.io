use super::*;

#[test]
fn equality_exactly_the_same_values() {
  let line_segment1 = LineSegment::default()
    .with_start(Point::at(1.0, 2.0))
    .with_end(Point::at(3.0, 4.0));
  let line_segment2 = LineSegment::default()
    .with_start(Point::at(1.0, 2.0))
    .with_end(Point::at(3.0, 4.0));

  assert_eq!(line_segment1, line_segment2);
}

#[test]
fn equality_close_to_the_same_values() {
  let line_segment1 = LineSegment::default()
    .with_start(Point::at(1.0, 2.0))
    .with_end(Point::at(3.0, 4.0));
  let line_segment2 = LineSegment::default()
    .with_start(Point::at(1.0000000000000001, 2.0))
    .with_end(Point::at(3.0, 4.0));

  assert_eq!(line_segment1, line_segment2);
}

#[test]
fn equality_different_values() {
  let line_segment1 = LineSegment::default()
    .with_start(Point::at(1.0, 2.0))
    .with_end(Point::at(3.0, 4.0));
  let line_segment2 = LineSegment::default()
    .with_start(Point::at(1.0, 2.0))
    .with_end(Point::at(3.0, 5.0));

  assert_ne!(line_segment1, line_segment2);
}

#[test]
fn is_intersection_with_polygon_line_segment() {
  let line_segment1 = LineSegment::default()
    .with_start(Point::at(0.0, 0.0))
    .with_end(Point::at(1.0, 1.0));
  let line_segment2 = LineSegment::default()
    .with_start(Point::at(0.0, 1.0))
    .with_end(Point::at(1.0, 0.0));

  assert!(line_segment1.is_intersecting_with_polygon_line_segment(&line_segment2));
}

#[test]
fn is_connected() {
  let line_segment1 = LineSegment::default()
    .with_start(Point::at(0.0, 0.0))
    .with_end(Point::at(1.0, 1.0));
  let line_segment2 = LineSegment::default()
    .with_start(Point::at(1.0, 1.0))
    .with_end(Point::at(2.0, 2.0));
  let line_segment3 = LineSegment::default()
    .with_start(Point::at(3.0, 3.0))
    .with_end(Point::at(4.0, 4.0));

  assert!(line_segment1.is_connected_to(&line_segment2));
  assert!(!line_segment1.is_connected_to(&line_segment3));
}
