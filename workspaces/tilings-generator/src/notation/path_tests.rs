use insta::assert_debug_snapshot;

use super::*;

#[test]
fn empty_path() {
  assert_debug_snapshot!(Path::default().from_string("", false));
}

#[test]
fn empty_path_with_type_ahead() {
  assert_debug_snapshot!(Path::default().from_string("", true));
}

#[test]
fn empty_shape_group() {
  assert_debug_snapshot!(Path::default().from_string("3-4,", false));
}

#[test]
fn empty_shape_group_with_type_ahead() {
  assert_debug_snapshot!(Path::default().from_string("3-", true));
}

#[test]
fn invalid_seed_shape_group() {
  assert_debug_snapshot!(Path::default().from_string("2", false));
}

#[test]
fn invalid_shape_group() {
  assert_debug_snapshot!(Path::default().from_string("3-2", false));
}

// #[test]
// fn sequence() -> Result<(), TilingError> {
//   let mut path = Path::default();

//   let test_length = 2000;
//   let mut test_output = vec![];
//   for _ in 0..test_length {
//     test_output.push(path.next_path().to_string());
//   }

//   assert_debug_snapshot!(test_output);

//   Ok(())
// }
