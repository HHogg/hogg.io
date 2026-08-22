use insta::assert_debug_snapshot;

use super::*;

#[test]
fn next() {
  let mut results: Vec<(Operation, Shape, u16)> = vec![];

  let operations = [Operation::Rotate, Operation::Reflect];
  let offsets = [Offset::Center];
  let shapes = [
    Shape::Triangle,
    Shape::Square,
    Shape::Hexagon,
    Shape::Octagon,
    Shape::Dodecagon,
  ];

  for operation in operations.iter() {
    for offset in offsets.iter() {
      for shape in shapes.iter() {
        let mut transform_value = TransformValue::default()
          .with_operation(*operation)
          .with_seed(Seed::default().with_shape(*shape).with_offset(*offset));

        results.push((*operation, *shape, transform_value.value));

        while let Some(next_transform_value) = transform_value.next_value() {
          results.push((*operation, *shape, next_transform_value.value));
        }
      }
    }
  }

  assert_debug_snapshot!(results);
}
