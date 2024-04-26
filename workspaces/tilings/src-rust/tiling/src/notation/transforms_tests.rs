use insta::assert_debug_snapshot;

use super::*;
use crate::notation::Shape;

#[test]
fn from_paths() {
  let shapes = [
    Shape::Triangle,
    Shape::Square,
    Shape::Hexagon,
    Shape::Octagon,
    Shape::Dodecagon,
  ];

  assert_debug_snapshot!(shapes
    .iter()
    .map(|shape| {
      (
        *shape,
        Transforms::first(Path::from(*shape), &Plane::default(), &Direction::FromStart)
          .map(|transforms| transforms.to_string()),
      )
    })
    .collect::<Vec<(Shape, Result<String, TilingError>)>>());
}
