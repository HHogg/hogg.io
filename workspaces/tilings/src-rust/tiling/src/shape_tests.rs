use super::Shape;
use crate::math::radian_to_degrees;

#[test]
fn test_shape_next() {
  assert_eq!(Shape::Triangle.next(), Some(Shape::Square));
  assert_eq!(Shape::Square.next(), Some(Shape::Hexagon));
  assert_eq!(Shape::Hexagon.next(), Some(Shape::Octagon));
  assert_eq!(Shape::Octagon.next(), Some(Shape::Dodecagon));
  assert_eq!(Shape::Dodecagon.next(), Some(Shape::Skip));
  assert_eq!(Shape::Skip.next(), None,);
}

#[test]
fn test_shape_get_radians() {
  assert_eq!(radian_to_degrees(Shape::Triangle.get_internal_angle()), 120);
  assert_eq!(radian_to_degrees(Shape::Square.get_internal_angle()), 90);
  assert_eq!(radian_to_degrees(Shape::Hexagon.get_internal_angle()), 60);
  assert_eq!(radian_to_degrees(Shape::Octagon.get_internal_angle()), 45);
  assert_eq!(radian_to_degrees(Shape::Dodecagon.get_internal_angle()), 30);
}
