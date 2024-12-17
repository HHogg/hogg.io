use insta::assert_debug_snapshot;

use super::*;
use crate::notation::{Notation, Shape};

#[test]
fn from_paths() {
  let shapes = [
    Shape::Triangle,
    Shape::Square,
    Shape::Hexagon,
    Shape::Octagon,
    Shape::Dodecagon,
  ];

  // assert_debug_snapshot!(shapes
  //   .iter()
  //   .map(|shape| {
  //     let notation: Notation = Path::from(*shape).into();
  //     let plane: Plane = notation.into();

  //     (
  //       *shape,
  //       Transforms::first(Path::from(*shape), &Plane::default(), &Direction::FromStart)
  //         .map(|transforms| transforms.to_string()),
  //     )
  //   })
  //   .collect::<Vec<(Shape, Result<String, TilingError>)>>());
}
