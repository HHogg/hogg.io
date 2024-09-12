use pretty_assertions::assert_eq;

use super::*;

fn assert_eq_points_to_points(a: Polygon, b: Vec<Point>) {
  assert_eq!(a.points.len(), b.len());
  assert_eq!(a.points, b);
}

fn assert_eq_points(a: Polygon, b: Vec<(f64, f64)>) {
  assert_eq_points_to_points(a, b.iter().map(|(x, y)| Point::at(*x, *y)).collect())
}

#[test]
fn at_center_triangle() {
  assert_eq_points(
    Polygon::default().with_shape(Shape::Triangle).at_center(),
    vec![(1.5, -0.86602545), (0.0, 0.0), (0.0, -1.7320509)],
  );
}

#[test]
fn at_center_square() {
  assert_eq_points(
    Polygon::default().with_shape(Shape::Square).at_center(),
    vec![
      (0.7071068, -0.7071068),
      (0.7071068, 0.7071068),
      (-0.7071068, 0.7071068),
      (-0.7071068, -0.7071068),
    ],
  );
}

#[test]
fn at_center_hexagon() {
  assert_eq_points(
    Polygon::default().with_shape(Shape::Hexagon).at_center(),
    vec![
      (0.5, -0.86602545),
      (1.0, 0.0),
      (0.5, 0.86602545),
      (-0.5, 0.86602545),
      (-1.0, 0.0),
      (-0.5, -0.86602545),
    ],
  );
}

#[test]
fn at_center_octagon() {
  assert_eq_points(
    Polygon::default().with_shape(Shape::Octagon).at_center(),
    vec![
      (0.38268346, -0.9238795),
      (0.9238795, -0.38268346),
      (0.9238795, 0.38268346),
      (0.38268346, 0.9238795),
      (-0.38268346, 0.9238795),
      (-0.9238795, 0.38268346),
      (-0.9238795, -0.38268346),
      (-0.38268346, -0.9238795),
    ],
  );
}

#[test]
fn at_center_dodecagon() {
  assert_eq_points(
    Polygon::default().with_shape(Shape::Dodecagon).at_center(),
    vec![
      (0.25881904, -0.9659258),
      (0.70710678, -0.7071067),
      (0.96592582, -0.2588190),
      (0.96592582, 0.25881904),
      (0.70710678, 0.70710678),
      (0.25881904, 0.96592582),
      (-0.2588190, 0.96592582),
      (-0.7071067, 0.70710678),
      (-0.9659258, 0.25881904),
      (-0.9659258, -0.2588190),
      (-0.7071067, -0.7071067),
      (-0.2588190, -0.9659258),
    ],
  );
}

#[test]
fn on_line_segment_triangle() {
  let p1 = Point::at(0.0, -1.7320508);
  let p2 = Point::at(1.5, -0.8660252);

  assert_eq_points(
    Polygon::default()
      .with_shape(Shape::Triangle)
      .on_line_segment(&LineSegment::default().with_start(p2).with_end(p1), 0),
    vec![(1.5, -2.598076), (p2.x, p2.y), (p1.x, p1.y)],
  );
}

#[test]
fn on_line_segment_square() {
  let p1 = Point::at(0.0, -1.7320508);
  let p2 = Point::at(1.5, -0.8660252);

  assert_eq_points(
    Polygon::default()
      .with_shape(Shape::Square)
      .on_line_segment(&LineSegment::default().with_start(p2).with_end(p1), 0),
    vec![
      (2.3660254, -2.3660254),
      (p2.x, p2.y),
      (p1.x, p1.y),
      (0.86602604, -3.2320504),
    ],
  );
}

#[test]
fn on_line_segment_hexagon() {
  let p1 = Point::at(0.0, -1.7320508);
  let p2 = Point::at(1.5, -0.8660252);

  assert_eq_points(
    Polygon::default()
      .with_shape(Shape::Hexagon)
      .on_line_segment(&LineSegment::default().with_start(p2).with_end(p1), 0),
    vec![
      (1.5, -4.330127),
      (3.0, -3.4641016),
      (3.0, -1.7320508),
      (p2.x, p2.y),
      (p1.x, p1.y),
      (0.0, -3.4641016),
    ],
  );
}

#[test]
fn on_line_segment_octagon() {
  let p1 = Point::at(0.0, -1.7320508);
  let p2 = Point::at(1.5, -0.8660252);

  assert_eq_points(
    Polygon::default()
      .with_shape(Shape::Octagon)
      .on_line_segment(&LineSegment::default().with_start(p2).with_end(p1), 0),
    vec![
      (2.0907702, -5.3533711),
      (3.59077, -4.4873457),
      (4.039058, -2.814313),
      (3.1730326, -1.314313),
      (p2.x, p2.y),
      (p1.x, p1.y),
      (-0.4482877, -3.4050834),
      (0.417737, -4.905083),
    ],
  );
}

#[test]
fn on_line_segment_dodecagon() {
  let p1 = Point::at(0.0, -1.7320508);
  let p2 = Point::at(1.5, -0.8660252);

  assert_eq_points(
    Polygon::default()
      .with_shape(Shape::Dodecagon)
      .on_line_segment(&LineSegment::default().with_start(p2).with_end(p1), 0),
    vec![
      (3.232050, -7.330127),
      (4.732050, -6.464101),
      (5.598076, -4.964101),
      (5.598076, -3.232050),
      (4.732050, -1.732050),
      (3.232050, -0.866025),
      (p2.x, p2.y),
      (p1.x, p1.y),
      (-0.866025, -3.2320508),
      (-0.866025, -4.9641016),
      (0.0, -6.4641016),
      (1.499999, -7.330127),
    ],
  );
}

#[test]
fn equality_exactly_the_same_values() {
  let shape1 = Polygon::default()
    .with_shape(Shape::Triangle)
    .with_points(vec![
      Point::at(0.0, 0.0),
      Point::at(1.0, 0.0),
      Point::at(0.5, 0.8660254037844386),
    ]);

  let shape2 = Polygon::default()
    .with_shape(Shape::Triangle)
    .with_points(vec![
      Point::at(0.0, 0.0),
      Point::at(1.0, 0.0),
      Point::at(0.5, 0.8660254037844386),
    ]);

  assert_eq!(shape1, shape2);
}

#[test]
fn equality_close_to_the_same_values() {
  let shape1 = Polygon::default()
    .with_shape(Shape::Triangle)
    .with_points(vec![
      Point::at(4.440892098500626e-16, 1.7320508075688772),
      Point::at(-2.8844440295753455e-16, 1.6653345369377348e-16),
      Point::at(1.5, 0.8660254037844377),
    ]);

  let shape2 = Polygon::default()
    .with_shape(Shape::Triangle)
    .with_points(vec![
      Point::at(1.5000000000000002, 0.8660254037844377),
      Point::at(2.884444029575345e-16, -1.6653345369377365e-16),
      Point::at(5.551115123125783e-16, 1.7320508075688767),
    ]);

  assert_eq!(shape1, shape2);
}

#[test]
fn equality_different_values() {
  let shape1 = Polygon::default()
    .with_shape(Shape::Triangle)
    .with_points(vec![
      Point::at(0.0, 0.0),
      Point::at(1.0, 0.0),
      Point::at(0.5, 0.8660254037844386),
    ]);

  let shape2 = Polygon::default()
    .with_shape(Shape::Triangle)
    .with_points(vec![
      Point::at(0.0, 0.0),
      Point::at(1.0, 0.0),
      Point::at(0.6, 0.8660254037844387),
    ]);

  assert_ne!(shape1, shape2);
}
