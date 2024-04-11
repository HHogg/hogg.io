use pretty_assertions::assert_eq;

use super::*;

#[test]
fn to_string_condenses_repeating_single_values() {
  assert_eq!(
    to_string(vec!([3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0])),
    String::from("3⁶")
  );
}

#[test]
fn to_string_condenses_repeating_2_values() {
  assert_eq!(
    to_string(vec!([3, 6, 3, 6, 3, 6, 0, 0, 0, 0, 0, 0])),
    String::from("(3.6)³")
  );
}

#[test]
fn to_string_condenses_repeating_3_values() {
  assert_eq!(
    to_string(vec!([3, 6, 4, 3, 6, 4, 0, 0, 0, 0, 0, 0])),
    String::from("(3.6.4)²")
  );
}

#[test]
fn to_string_not_condenses_repeating_multiple_values_with_extra() {
  assert_eq!(
    to_string(vec!([3, 6, 3, 6, 3, 6, 4, 0, 0, 0, 0, 0])),
    String::from("3.6.3.6.3.6.4")
  );
}

#[test]
fn to_string_condenses_multiple_sequences() {
  assert_eq!(
    to_string(vec![
      [3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0],
      [3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0],
      [3, 6, 4, 3, 6, 4, 0, 0, 0, 0, 0, 0],
      [3, 6, 4, 3, 6, 4, 0, 0, 0, 0, 0, 0],
      [4, 4, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0],
      [4, 4, 6, 4, 4, 6, 0, 0, 0, 0, 0, 0],
      [4, 4, 6, 4, 4, 6, 0, 0, 0, 0, 0, 0]
    ]),
    "[3⁶]²; [(3.6.4)²]²; 4².6²; [(4².6)²]²"
  );
}

// #[test]
// fn to_string_uses_the_min_permutation() {
//   // Forwards
//   assert_eq!(
//     to_string(vec!([2, 6, 5, 6, 6, 0, 0, 0, 0, 0, 0, 0])),
//     String::from("2.6.5.6²")
//   );

//   assert_eq!(
//     to_string(vec!([6, 2, 6, 5, 6, 0, 0, 0, 0, 0, 0, 0])),
//     String::from("2.6.5.6²"),
//   );

//   assert_eq!(
//     to_string(vec!([6, 6, 2, 6, 5, 0, 0, 0, 0, 0, 0, 0])),
//     String::from("2.6.5.6²"),
//   );

//   assert_eq!(
//     to_string(vec!([5, 6, 6, 2, 6, 0, 0, 0, 0, 0, 0, 0])),
//     String::from("2.6.5.6²"),
//   );

//   assert_eq!(
//     to_string(vec!([6, 5, 6, 6, 2, 0, 0, 0, 0, 0, 0, 0])),
//     String::from("2.6.5.6²"),
//   );

//   // Backwards
//   assert_eq!(
//     to_string(vec!([2, 6, 6, 5, 6, 0, 0, 0, 0, 0, 0, 0])),
//     String::from("2.6.5.6²")
//   );
// }

// #[test]
// fn to_string_handles_multiple_sequences() {
//   assert_eq!(
//     to_string(vec![
//       [3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0],
//       [3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0],
//       [4, 4, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0]
//     ]),
//     "(3⁶)²; 4².6²"
//   );
// }
