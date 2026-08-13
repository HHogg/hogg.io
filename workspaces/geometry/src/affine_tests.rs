use hogg_spatial_grid_map::utils::{Fxx, PI};

use super::*;

fn assert_close(actual: Fxx, expected: Fxx) {
  assert!(
    (actual - expected).abs() < 1.0e-10,
    "expected {expected}, got {actual}"
  );
}

fn assert_point_close(actual: Point, expected: Point) {
  assert_close(actual.x, expected.x);
  assert_close(actual.y, expected.y);
}

fn assert_vector_close(actual: Vector2, expected: Vector2) {
  assert_close(actual.x, expected.x);
  assert_close(actual.y, expected.y);
}

#[test]
fn identity_preserves_a_point_and_its_index() {
  let point = Point::at(2.0, -3.0).with_index(7);
  let transformed = Affine2::identity().apply(&point);

  assert_point_close(transformed, point);
  assert_eq!(transformed.index, 7);
}

#[test]
fn rotates_about_an_arbitrary_origin() {
  let transform = Affine2::rotation(PI * 0.5, Some(&Point::at(1.0, 1.0)));
  let transformed = transform.apply(&Point::at(2.0, 1.0));

  assert_point_close(transformed, Point::at(1.0, 2.0));
  assert_close(transform.determinant(), 1.0);
  assert!(!transform.reverses_orientation());
}

#[test]
fn reflects_in_a_translated_line() {
  let line = LineSegment::default()
    .with_start(Point::at(2.0, -1.0))
    .with_end(Point::at(2.0, 3.0));
  let transform = Affine2::reflection(&line).expect("line defines a reflection");
  let transformed = transform.apply(&Point::at(5.0, 4.0));

  assert_point_close(transformed, Point::at(-1.0, 4.0));
  assert_close(transform.determinant(), -1.0);
  assert!(transform.reverses_orientation());
}

#[test]
fn rejects_a_zero_length_reflection_line() {
  let point = Point::at(2.0, 3.0);
  let line = LineSegment::default().with_start(point).with_end(point);

  assert!(Affine2::reflection(&line).is_none());
}

#[test]
#[should_panic(expected = "reflection points must define a finite, non-zero-length line")]
fn point_reflection_does_not_silently_accept_an_invalid_line() {
  let point = Point::at(2.0, 3.0);

  point.reflect(&Point::default(), &Point::default());
}

#[test]
fn composition_applies_the_other_transform_first() {
  let translation = Affine2::from_translation(Vector2::new(2.0, 0.0));
  let rotation = Affine2::rotation(PI * 0.5, None);
  let composed = rotation.compose(&translation);
  let point = Point::at(1.0, 0.0);

  assert_point_close(
    composed.apply(&point),
    rotation.apply(&translation.apply(&point)),
  );
  assert_point_close(composed.apply(&point), Point::at(0.0, 3.0));
}

#[test]
fn inverse_round_trips_a_point() {
  let rotation = Affine2::rotation(PI / 3.0, Some(&Point::at(2.0, -4.0)));
  let translation = Affine2::from_translation(Vector2::new(7.0, 9.0));
  let transform = translation.compose(&rotation);
  let inverse = transform.inverse().expect("transform is invertible");
  let point = Point::at(-5.0, 8.0);

  assert_point_close(inverse.apply(&transform.apply(&point)), point);
}

#[test]
fn singular_transform_has_no_inverse() {
  let transform = Affine2::from_parts([1.0, 2.0, 2.0, 4.0], Vector2::new(3.0, 5.0));

  assert!(transform.inverse().is_none());
}

#[test]
fn exposes_linear_and_translation_parts() {
  let transform = Affine2::from_parts([1.0, 2.0, 3.0, 4.0], Vector2::new(5.0, 6.0));

  assert_eq!(transform.linear(), [1.0, 2.0, 3.0, 4.0]);
  assert_eq!(transform.translation(), Vector2::new(5.0, 6.0));
  assert_vector_close(
    transform.apply_vector(Vector2::new(7.0, 8.0)),
    Vector2::new(23.0, 53.0),
  );
}
