use insta::assert_debug_snapshot;

use super::*;
use crate::notation::{Notation, Shape};

#[test]
fn first_from_start() {
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
      let transforms = Notation::default()
        .with_path((*shape).into(), Direction::FromStart, true)
        .and_then(|notation| {
          Transforms::first(
            &notation.path,
            &Some(&notation.path_plane),
            &Direction::FromStart,
          )
        })
        .map(|transforms| transforms.to_string());

      (*shape, transforms)
    })
    .collect::<Vec<(Shape, Result<String, TilingError>)>>());
}
