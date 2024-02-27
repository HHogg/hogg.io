use super::*;

#[test]
fn equality_exactly_the_same_values() {
  let line_segment1 = LineSegment::default()
    .with_start(Point::default().with_xy(1.0, 2.0))
    .with_end(Point::default().with_xy(3.0, 4.0));
  let line_segment2 = LineSegment::default()
    .with_start(Point::default().with_xy(1.0, 2.0))
    .with_end(Point::default().with_xy(3.0, 4.0));

  assert_eq!(line_segment1, line_segment2);
}

#[test]
fn equality_close_to_the_same_values() {
  let line_segment1 = LineSegment::default()
    .with_start(Point::default().with_xy(1.0, 2.0))
    .with_end(Point::default().with_xy(3.0, 4.0));
  let line_segment2 = LineSegment::default()
    .with_start(Point::default().with_xy(1.0000000000000001, 2.0))
    .with_end(Point::default().with_xy(3.0, 4.0));

  assert_eq!(line_segment1, line_segment2);
}

#[test]
fn equality_different_values() {
  let line_segment1 = LineSegment::default()
    .with_start(Point::default().with_xy(1.0, 2.0))
    .with_end(Point::default().with_xy(3.0, 4.0));
  let line_segment2 = LineSegment::default()
    .with_start(Point::default().with_xy(1.0, 2.0))
    .with_end(Point::default().with_xy(3.0, 5.0));

  assert_ne!(line_segment1, line_segment2);
}

#[test]
fn hashing_exactly_the_same_values() {
  let line_segment1 = LineSegment::default()
    .with_start(Point::default().with_xy(1.0, 2.0))
    .with_end(Point::default().with_xy(3.0, 4.0));
  let line_segment2 = LineSegment::default()
    .with_start(Point::default().with_xy(1.0, 2.0))
    .with_end(Point::default().with_xy(3.0, 4.0));

  let mut hasher1 = std::collections::hash_map::DefaultHasher::new();
  let mut hasher2 = std::collections::hash_map::DefaultHasher::new();

  line_segment1.hash(&mut hasher1);
  line_segment2.hash(&mut hasher2);

  assert_eq!(hasher1.finish(), hasher2.finish());
}

#[test]
fn hashing_close_to_the_same_values() {
  let line_segment1 = LineSegment::default()
    .with_start(Point::default().with_xy(1.0, 2.0))
    .with_end(Point::default().with_xy(3.0, 4.0));
  let line_segment2 = LineSegment::default()
    .with_start(Point::default().with_xy(1.0000000000000001, 2.0))
    .with_end(Point::default().with_xy(3.0, 4.0));

  let mut hasher1 = std::collections::hash_map::DefaultHasher::new();
  let mut hasher2 = std::collections::hash_map::DefaultHasher::new();

  line_segment1.hash(&mut hasher1);
  line_segment2.hash(&mut hasher2);

  assert_eq!(hasher1.finish(), hasher2.finish());
}

#[test]
fn hashing_different_values() {
  let line_segment1 = LineSegment::default()
    .with_start(Point::default().with_xy(1.0, 2.0))
    .with_end(Point::default().with_xy(3.0, 4.0));
  let line_segment2 = LineSegment::default()
    .with_start(Point::default().with_xy(1.0, 2.0))
    .with_end(Point::default().with_xy(3.0, 5.0));

  let mut hasher1 = std::collections::hash_map::DefaultHasher::new();
  let mut hasher2 = std::collections::hash_map::DefaultHasher::new();

  line_segment1.hash(&mut hasher1);
  line_segment2.hash(&mut hasher2);

  assert_ne!(hasher1.finish(), hasher2.finish());
}

#[test]
fn hashing_with_flipped_values() {
  let line_segment1 = LineSegment::default()
    .with_start(Point::default().with_xy(1.0, 2.0))
    .with_end(Point::default().with_xy(3.0, 4.0));
  let line_segment2 = LineSegment::default()
    .with_start(Point::default().with_xy(3.0, 4.0))
    .with_end(Point::default().with_xy(1.0, 2.0));

  let mut hasher1 = std::collections::hash_map::DefaultHasher::new();
  let mut hasher2 = std::collections::hash_map::DefaultHasher::new();

  line_segment1.hash(&mut hasher1);
  line_segment2.hash(&mut hasher2);

  assert_ne!(hasher1.finish(), hasher2.finish());
}

#[test]
fn ordering() {
  let line_segment1 = LineSegment::default()
    .with_start(Point::default().with_xy(1.0, -1.0))
    .with_end(Point::default().with_xy(1.0, 0.0));
  let line_segment2 = LineSegment::default()
    .with_start(Point::default().with_xy(1.0, 1.0))
    .with_end(Point::default().with_xy(0.0, 1.0));
  let line_segment3 = LineSegment::default()
    .with_start(Point::default().with_xy(-1.0, 1.0))
    .with_end(Point::default().with_xy(-1.0, 0.0));
  let line_segment4 = LineSegment::default()
    .with_start(Point::default().with_xy(-1.0, -1.0))
    .with_end(Point::default().with_xy(0.0, -1.0));

  let line_segments = vec![line_segment1, line_segment2, line_segment3, line_segment4];

  let mut sorted_line_segments = line_segments.clone();
  sorted_line_segments.sort();

  assert_eq!(line_segments, sorted_line_segments);
}

#[test]
fn intersects() {
  let line_segment1 = LineSegment::default()
    .with_start(Point::default().with_xy(0.0, 0.0))
    .with_end(Point::default().with_xy(1.0, 1.0));
  let line_segment2 = LineSegment::default()
    .with_start(Point::default().with_xy(0.0, 1.0))
    .with_end(Point::default().with_xy(1.0, 0.0));

  assert!(line_segment1.intersects_line_segment(&line_segment2));
}

#[test]
fn is_connected() {
  let line_segment1 = LineSegment::default()
    .with_start(Point::default().with_xy(0.0, 0.0))
    .with_end(Point::default().with_xy(1.0, 1.0));
  let line_segment2 = LineSegment::default()
    .with_start(Point::default().with_xy(1.0, 1.0))
    .with_end(Point::default().with_xy(2.0, 2.0));
  let line_segment3 = LineSegment::default()
    .with_start(Point::default().with_xy(3.0, 3.0))
    .with_end(Point::default().with_xy(4.0, 4.0));

  assert!(line_segment1.is_connected(&line_segment2));
  assert!(!line_segment1.is_connected(&line_segment3));
}
