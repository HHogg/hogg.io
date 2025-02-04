use std::f32::consts::PI;

use super::*;

#[test]
fn equality_exactly_the_same_values() {
  let a = Point::at(1.0, 2.0);
  let b = Point::at(1.0, 2.0);

  assert_eq!(a, b);
}

#[test]
fn equality_close_to_the_same_values() {
  let a = Point::at(-2.884_444e-16, 1.665_334_5e-16);
  let b = Point::at(2.884_444e-16, -1.665_334_5e-16);

  assert_eq!(a, b);
}

#[test]
fn equality_different_values() {
  let a = Point::at(1.0, 2.0);
  let b = Point::at(1.0, 3.0);

  assert_ne!(a, b);
}

#[test]
fn centroid_from_vec_points() {
  let points = vec![
    Point::at(0.0, 0.0),
    Point::at(1.0, 1.0),
    Point::at(2.0, 2.0),
  ];

  let centroid: Point = (&points).into();

  assert_eq!(centroid, Point::at(1.0, 1.0));
}

#[test]
fn distance() {
  let a = Point::at(0.0, 0.0);
  let b = Point::at(1.0, 0.0);

  assert_eq!(a.distance_to(&b), 1.0);

  let c = Point::at(1.0, 0.0);
  let d = Point::at(0.0, 0.0);

  assert_eq!(c.distance_to(&d), 1.0);
}

#[test]
fn radians_to_point() {
  assert_eq!(Point::at(0.0, 0.0).radian_to(&Point::at(0.0, 0.0)), 0.0);
  assert_eq!(Point::at(0.0, -1.0).radian_to(&Point::at(0.0, 0.0)), 0.0);
  assert_eq!(
    Point::at(1.0, 0.0).radian_to(&Point::at(0.0, 0.0)),
    PI * 0.5
  );

  assert_eq!(Point::at(0.0, 1.0).radian_to(&Point::at(0.0, 0.0)), PI);

  assert_eq!(
    Point::at(-1.0, 0.0).radian_to(&Point::at(0.0, 0.0)),
    PI * 1.5
  );
}

#[test]
fn reflect() {
  let point = Point::at(1.0, 1.0);
  let p1 = Point::at(0.0, 0.0);
  let p2 = Point::at(1.0, 0.0);

  let reflected = point.reflect(&p1, &p2);

  assert!((reflected.x - 1.0).abs() < f32::EPSILON);
  assert!((reflected.y - -1.0).abs() < f32::EPSILON);
}

#[test]
fn rotate() {
  let point = Point::at(1.0, 0.0);
  let radians = PI / 2.0;
  let origin = Point::at(0.0, 0.0);
  let rotated = point.rotate(radians, Some(&origin));
  assert!(rotated.x < f32::EPSILON);
  assert!((rotated.y - 1.0).abs() < f32::EPSILON);
}

#[test]
fn translate() {
  let point = Point::at(1.0, 1.0);
  let shift = Point::at(1.0, 1.0);
  let translated = point.translate(&shift);
  assert_eq!(translated.x, 2.0);
  assert_eq!(translated.y, 2.0);
}

#[test]
fn correctly_sorts_points_around_origin() {
  let mut points = vec![
    Point::at(1.0, 0.0),
    Point::at(0.0, -1.0),
    Point::at(-1.0, 0.0),
    Point::at(0.0, 1.0),
  ];

  sort_points_around_origin(&mut points, &Point::default());

  assert_eq!(
    points,
    vec![
      Point::at(0.0, -1.0),
      Point::at(1.0, 0.0),
      Point::at(0.0, 1.0),
      Point::at(-1.0, 0.0),
    ]
  );
}
