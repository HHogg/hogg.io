use std::f64::consts::PI;

use super::*;

fn assert_eq_points_to_points(a: Vec<Point>, b: Vec<Point>) {
  assert_eq!(a.len(), b.len());

  for (index, point) in a.iter().enumerate() {
    let point_expected = &b[index];
    assert_eq!(point, point_expected)
  }
}

fn assert_eq_points(a: Vec<Point>, b: Vec<(f64, f64)>) {
  assert_eq_points_to_points(a, b.iter().map(|(x, y)| Point::at(*x, *y)).collect())
}

#[test]
fn equality_exactly_the_same_values() {
  let a = Point::at(1.0, 2.0);
  let b = Point::at(1.0, 2.0);

  assert_eq!(a, b);
}

#[test]
fn equality_close_to_the_same_values() {
  let a = Point::at(-2.8844440295753455e-16, 1.6653345369377348e-16);
  let b = Point::at(2.884444029575345e-16, -1.6653345369377365e-16);

  assert_eq!(a, b);
}

#[test]
fn equality_different_values() {
  let a = Point::at(1.0, 2.0);
  let b = Point::at(1.0, 3.0);

  assert_ne!(a, b);
}

#[test]
fn ordering() {
  let a = Point::at(-1.0, -1.0);
  let b = Point::at(1.0, -1.0);
  let c = Point::at(1.0, 1.0);
  let d = Point::at(-1.0, 1.0);

  let mut points = vec![b, c, d, a];
  points.sort();

  assert_eq_points(
    points,
    vec![(1.0, -1.0), (1.0, 1.0), (-1.0, 1.0), (-1.0, -1.0)],
  );
}

#[test]
fn ordering_precision_1() {
  let mut a = vec![
    Point::at(4.440892098500626e-16, 1.7320508075688772),
    Point::at(-2.8844440295753455e-16, 1.6653345369377348e-16),
    Point::at(1.5, 0.8660254037844377),
  ];

  let mut b = vec![
    Point::at(1.5000000000000002, 0.8660254037844377),
    Point::at(2.884444029575345e-16, -1.6653345369377365e-16),
    Point::at(5.551115123125783e-16, 1.7320508075688767),
  ];

  a.sort();
  b.sort();

  assert_eq_points_to_points(a, b);
}

#[test]
fn ordering_precision_2() {
  let mut a = vec![
    Point::at(-1.5000000000000004, -0.8660254037844378),
    Point::at(-2.884444029575344e-16, 1.6653345369377368e-16),
    Point::at(-5.551115123125783e-16, -1.7320508075688767),
  ];

  let mut b = vec![
    Point::at(-3.3306690738754696e-16, -1.7320508075688774),
    Point::at(2.884444029575346e-16, -1.6653345369377348e-16),
    Point::at(-1.5000000000000002, -0.8660254037844379),
  ];

  a.sort();
  b.sort();

  assert_eq_points_to_points(a, b);
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

// #[test]
// fn to_line_segments() {
//   let p1 = Point::default().with_xy(1.0, -1.0);
//   let p2 = Point::default().with_xy(1.0, 1.0);
//   let p3 = Point::default().with_xy(-1.0, 1.0);
//   let p4 = Point::default().with_xy(-1.0, -1.0);

//   assert_eq!(
//     get_line_segments_from_points(&[p4, p3, p2, p1]),
//     vec![
//       LineSegment::new(p1, p2),
//       LineSegment::new(p2, p3),
//       LineSegment::new(p3, p4),
//       LineSegment::new(p4, p1),
//     ],
//   );
// }

#[test]
fn reflect() {
  let point = Point::at(1.0, 1.0);
  let p1 = Point::at(0.0, 0.0);
  let p2 = Point::at(1.0, 0.0);

  let reflected = point.reflect(&p1, &p2);

  assert!((reflected.x - 1.0).abs() < f64::EPSILON);
  assert!((reflected.y - -1.0).abs() < f64::EPSILON);
}

#[test]
fn rotate() {
  let point = Point::at(1.0, 0.0);
  let radians = PI / 2.0;
  let origin = Point::at(0.0, 0.0);
  let rotated = point.rotate(radians, Some(&origin));
  assert!(rotated.x < f64::EPSILON);
  assert!((rotated.y - 1.0).abs() < f64::EPSILON);
}

#[test]
fn translate() {
  let point = Point::at(1.0, 1.0);
  let shift = Point::at(1.0, 1.0);
  let translated = point.translate(&shift);
  assert_eq!(translated.x, 2.0);
  assert_eq!(translated.y, 2.0);
}
