use super::Vector2;

#[test]
fn supports_vector_arithmetic() {
  let first = Vector2::new(2.0, 3.0);
  let second = Vector2::new(-1.0, 4.0);

  assert_eq!(first + second, Vector2::new(1.0, 7.0));
  assert_eq!(first - second, Vector2::new(3.0, -1.0));
  assert_eq!(first * 2.0, Vector2::new(4.0, 6.0));
}

#[test]
fn computes_length_and_cross_product() {
  assert_eq!(Vector2::new(3.0, 4.0).length(), 5.0);
  assert_eq!(Vector2::new(2.0, 0.0).cross(Vector2::new(0.0, 3.0)), 6.0);
}
