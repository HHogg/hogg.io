use std::collections::hash_map::DefaultHasher;

use pretty_assertions::assert_eq;

use super::*;

#[test]
fn equality_exactly_the_same_values() {
  let shape1 = Polygon::default().with_points(vec![
    Point::default().with_xy(0.0, 0.0),
    Point::default().with_xy(1.0, 0.0),
    Point::default().with_xy(0.5, 0.8660254037844386),
  ]);

  let shape2 = Polygon::default().with_points(vec![
    Point::default().with_xy(0.0, 0.0),
    Point::default().with_xy(1.0, 0.0),
    Point::default().with_xy(0.5, 0.8660254037844386),
  ]);

  assert_eq!(shape1, shape2);
}

#[test]
fn equality_close_to_the_same_values() {
  let shape1 = Polygon::default().with_points(vec![
    Point::default().with_xy(4.440892098500626e-16, 1.7320508075688772),
    Point::default().with_xy(-2.8844440295753455e-16, 1.6653345369377348e-16),
    Point::default().with_xy(1.5, 0.8660254037844377),
  ]);

  let shape2 = Polygon::default().with_points(vec![
    Point::default().with_xy(1.5000000000000002, 0.8660254037844377),
    Point::default().with_xy(2.884444029575345e-16, -1.6653345369377365e-16),
    Point::default().with_xy(5.551115123125783e-16, 1.7320508075688767),
  ]);

  assert_eq!(shape1, shape2);
}

#[test]
fn equality_different_values() {
  let shape1 = Polygon::default().with_points(vec![
    Point::default().with_xy(0.0, 0.0),
    Point::default().with_xy(1.0, 0.0),
    Point::default().with_xy(0.5, 0.8660254037844386),
  ]);

  let shape2 = Polygon::default().with_points(vec![
    Point::default().with_xy(0.0, 0.0),
    Point::default().with_xy(1.0, 0.0),
    Point::default().with_xy(0.6, 0.8660254037844387),
  ]);

  assert_ne!(shape1, shape2);
}

#[test]
fn hashing_exactly_the_same_values() {
  let shape1 = Polygon::default().with_points(vec![
    Point::default().with_xy(0.0, 0.0),
    Point::default().with_xy(1.0, 0.0),
    Point::default().with_xy(0.5, 0.8660254037844386),
  ]);

  let shape2 = Polygon::default().with_points(vec![
    Point::default().with_xy(0.0, 0.0),
    Point::default().with_xy(1.0, 0.0),
    Point::default().with_xy(0.5, 0.8660254037844386),
  ]);

  let mut hasher1 = DefaultHasher::new();
  shape1.hash(&mut hasher1);

  let mut hasher2 = DefaultHasher::new();
  shape2.hash(&mut hasher2);

  assert_eq!(hasher1.finish(), hasher2.finish());
}

#[test]
fn hashing_close_to_the_same_values() {
  let shape1 = Polygon::default().with_points(vec![
    Point::default().with_xy(-1.5000000000000004, -0.8660254037844378),
    Point::default().with_xy(-2.884444029575344e-16, 1.6653345369377368e-16),
    Point::default().with_xy(-5.551115123125783e-16, -1.7320508075688767),
  ]);

  let shape2 = Polygon::default().with_points(vec![
    Point::default().with_xy(-3.3306690738754696e-16, -1.7320508075688774),
    Point::default().with_xy(2.884444029575346e-16, -1.6653345369377348e-16),
    Point::default().with_xy(-1.5000000000000002, -0.8660254037844379),
  ]);

  let mut hasher1 = DefaultHasher::new();
  shape1.hash(&mut hasher1);

  let mut hasher2 = DefaultHasher::new();
  shape2.hash(&mut hasher2);

  assert_eq!(hasher1.finish(), hasher2.finish());
}

#[test]
fn hashing_different_values() {
  let shape1 = Polygon::default().with_points(vec![
    Point::default().with_xy(0.0, 0.0),
    Point::default().with_xy(1.0, 0.0),
    Point::default().with_xy(0.5, 0.8660254037844386),
  ]);

  let shape2 = Polygon::default().with_points(vec![
    Point::default().with_xy(0.0, 0.0),
    Point::default().with_xy(1.0, 0.0),
    Point::default().with_xy(0.7, 0.8660254037844387),
  ]);

  let mut hasher1 = DefaultHasher::new();
  shape1.hash(&mut hasher1);

  let mut hasher2 = DefaultHasher::new();
  shape2.hash(&mut hasher2);

  assert_ne!(hasher1.finish(), hasher2.finish());
}

#[test]
fn hashing_flipped_values() {
  let shape1 = Polygon::default().with_points(vec![
    Point::default().with_xy(0.0, 0.0),
    Point::default().with_xy(1.0, 0.0),
    Point::default().with_xy(0.5, 0.8660254037844386),
  ]);

  let shape2 = Polygon::default().with_points(vec![
    Point::default().with_xy(0.5, 0.8660254037844386),
    Point::default().with_xy(1.0, 0.0),
    Point::default().with_xy(0.0, 0.0),
  ]);

  let mut hasher1 = DefaultHasher::new();
  shape1.hash(&mut hasher1);

  let mut hasher2 = DefaultHasher::new();
  shape2.hash(&mut hasher2);

  assert_eq!(hasher1.finish(), hasher2.finish());
}

#[test]
fn contains_triangle() {
  let shape = Polygon::default().with_points(vec![
    Point::default().with_xy(0.0, 0.0),
    Point::default().with_xy(1.0, 1.0),
    Point::default().with_xy(1.0, 0.0),
  ]);

  assert!(!shape.contains_point(&Point::default().with_xy(0.0, 0.0)));
  assert!(!shape.contains_point(&Point::default().with_xy(1.0, 1.0)));
  assert!(!shape.contains_point(&Point::default().with_xy(1.0, 0.0)));
  assert!(!shape.contains_point(&Point::default().with_xy(-2.0, -2.0)));
  assert!(!shape.contains_point(&Point::default().with_xy(2.0, 2.0)));

  assert!(shape.contains_point(&Point::default().with_xy(0.75, 0.25)));

  let shape = Polygon::default().with_points(vec![
    Point::default().with_xy(1.366, -1.366),
    Point::default().with_xy(1.366, -2.366),
    Point::default().with_xy(2.232, -1.866),
  ]);

  assert!(!shape.contains_point(&Point::default().with_xy(0.5, -2.866)));
}

#[test]
fn contains_dodecagon() {
  let shape = Polygon::default().with_points(vec![
    Point::default().with_xy(0.259, -0.966),
    Point::default().with_xy(-0.0, -1.415),
    Point::default().with_xy(0.0, -1.933),
    Point::default().with_xy(0.259, -2.382),
    Point::default().with_xy(0.708, -2.641),
    Point::default().with_xy(1.226, -2.641),
    Point::default().with_xy(1.675, -2.382),
    Point::default().with_xy(1.934, -1.933),
    Point::default().with_xy(1.934, -1.415),
    Point::default().with_xy(1.675, -0.966),
    Point::default().with_xy(1.226, -0.707),
    Point::default().with_xy(0.708, -0.707),
  ]);

  assert!(shape.contains_point(&Point::default().with_xy(0.707, -1.224)));
}
