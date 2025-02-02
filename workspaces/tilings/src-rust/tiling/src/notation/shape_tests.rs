use super::Shape;

#[test]
fn test_shape_next() {
  assert_eq!(Shape::Triangle.next(), Some(Shape::Square));
  assert_eq!(Shape::Square.next(), Some(Shape::Hexagon));
  assert_eq!(Shape::Hexagon.next(), Some(Shape::Octagon));
  assert_eq!(Shape::Octagon.next(), Some(Shape::Dodecagon));
  assert_eq!(Shape::Dodecagon.next(), Some(Shape::Skip));
  assert_eq!(Shape::Skip.next(), None,);
}
