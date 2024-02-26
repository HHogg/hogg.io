use pretty_assertions::assert_eq;

use super::*;

#[test]
fn lengths_of_sequence() {
  assert_eq!(length(&[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), 0);
  assert_eq!(length(&[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), 1);
  assert_eq!(length(&[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), 2);
  assert_eq!(length(&[1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]), 3);
  assert_eq!(length(&[1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0]), 4);
  assert_eq!(length(&[1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0]), 5);
  assert_eq!(length(&[1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0]), 6);
  assert_eq!(length(&[1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0]), 7);
  assert_eq!(length(&[1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0]), 8);
  assert_eq!(length(&[1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0]), 9);
  assert_eq!(length(&[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0]), 10);
  assert_eq!(length(&[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0]), 11);
  assert_eq!(length(&[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]), 12);
}

#[test]
fn rotates_sequences() {
  assert_eq!(
    rotate(&[1, 2, 3, 4, 5, 0, 0, 0, 0, 0, 0, 0], 2, true),
    [3, 4, 5, 1, 2, 0, 0, 0, 0, 0, 0, 0]
  );
  assert_eq!(
    rotate(&[1, 2, 3, 4, 5, 0, 0, 0, 0, 0, 0, 0], 2, false),
    [3, 2, 1, 5, 4, 0, 0, 0, 0, 0, 0, 0]
  );
}

#[test]
fn reverses_sequences() {
  assert_eq!(
    reverse(&[1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    [3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  );
}

#[test]
fn identifies_bidirectional_sequences() {
  assert_eq!(
    is_bidirectional(&[3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0]),
    true
  );
  assert_eq!(
    is_bidirectional(&[4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0]),
    true
  );
  assert_eq!(
    is_bidirectional(&[6, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    true
  );
  assert_eq!(
    is_bidirectional(&[3, 3, 3, 3, 6, 0, 0, 0, 0, 0, 0, 0]),
    true
  );
  assert_eq!(
    is_bidirectional(&[3, 3, 3, 4, 4, 0, 0, 0, 0, 0, 0, 0]),
    true
  );
  assert_eq!(
    is_bidirectional(&[3, 3, 4, 3, 4, 0, 0, 0, 0, 0, 0, 0]),
    true
  );
  assert_eq!(
    is_bidirectional(&[3, 4, 3, 12, 0, 0, 0, 0, 0, 0, 0, 0]),
    true
  );
  assert_eq!(
    is_bidirectional(&[3, 3, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0]),
    true
  );
  assert_eq!(
    is_bidirectional(&[3, 6, 3, 6, 0, 0, 0, 0, 0, 0, 0, 0]),
    true
  );
  assert_eq!(
    is_bidirectional(&[3, 4, 6, 4, 0, 0, 0, 0, 0, 0, 0, 0]),
    true
  );
  assert_eq!(
    is_bidirectional(&[3, 12, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    true
  );
  assert_eq!(
    is_bidirectional(&[4, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    true
  );
}

#[test]
fn identifies_non_bidirectional_sequences() {
  assert_eq!(
    is_bidirectional(&[3, 3, 4, 12, 0, 0, 0, 0, 0, 0, 0, 0]),
    false
  );
  assert_eq!(
    is_bidirectional(&[3, 4, 4, 6, 0, 0, 0, 0, 0, 0, 0, 0]),
    false
  );
  assert_eq!(
    is_bidirectional(&[4, 6, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    false
  );
}

#[test]
fn to_string_uses_the_min_permutation() {
  // Forwards
  assert_eq!(
    to_string(vec!([2, 6, 5, 6, 6, 0, 0, 0, 0, 0, 0, 0])),
    String::from("2.6.5.6²")
  );

  assert_eq!(
    to_string(vec!([6, 2, 6, 5, 6, 0, 0, 0, 0, 0, 0, 0])),
    String::from("2.6.5.6²"),
  );

  assert_eq!(
    to_string(vec!([6, 6, 2, 6, 5, 0, 0, 0, 0, 0, 0, 0])),
    String::from("2.6.5.6²"),
  );

  assert_eq!(
    to_string(vec!([5, 6, 6, 2, 6, 0, 0, 0, 0, 0, 0, 0])),
    String::from("2.6.5.6²"),
  );

  assert_eq!(
    to_string(vec!([6, 5, 6, 6, 2, 0, 0, 0, 0, 0, 0, 0])),
    String::from("2.6.5.6²"),
  );

  // Backwards
  assert_eq!(
    to_string(vec!([2, 6, 6, 5, 6, 0, 0, 0, 0, 0, 0, 0])),
    String::from("2.6.5.6²")
  );
}

#[test]
fn to_string_handles_multiple_sequences() {
  assert_eq!(
    to_string(vec![
      [3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0],
      [3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0],
      [4, 4, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0]
    ]),
    "(3⁶)²; 4².6²"
  );
}

#[test]
fn sort_returns_correct_order() {
  assert_eq!(
    sort(vec![
      [3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0],
      [4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0],
      [6, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [3, 3, 3, 3, 6, 0, 0, 0, 0, 0, 0, 0],
      [3, 3, 3, 4, 4, 0, 0, 0, 0, 0, 0, 0],
      [3, 3, 4, 3, 4, 0, 0, 0, 0, 0, 0, 0],
      [3, 3, 4, 12, 0, 0, 0, 0, 0, 0, 0, 0],
      [3, 4, 3, 12, 0, 0, 0, 0, 0, 0, 0, 0],
      [3, 3, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0],
      [3, 6, 3, 6, 0, 0, 0, 0, 0, 0, 0, 0],
      [3, 4, 4, 6, 0, 0, 0, 0, 0, 0, 0, 0],
      [3, 4, 6, 4, 0, 0, 0, 0, 0, 0, 0, 0],
      [3, 12, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [4, 6, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [4, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]),
    vec![
      [3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0],
      [3, 3, 3, 3, 6, 0, 0, 0, 0, 0, 0, 0],
      [3, 3, 3, 4, 4, 0, 0, 0, 0, 0, 0, 0],
      [3, 3, 4, 3, 4, 0, 0, 0, 0, 0, 0, 0],
      [3, 3, 4, 12, 0, 0, 0, 0, 0, 0, 0, 0],
      [3, 3, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0],
      [3, 4, 3, 12, 0, 0, 0, 0, 0, 0, 0, 0],
      [3, 4, 4, 6, 0, 0, 0, 0, 0, 0, 0, 0],
      [3, 4, 6, 4, 0, 0, 0, 0, 0, 0, 0, 0],
      [3, 6, 3, 6, 0, 0, 0, 0, 0, 0, 0, 0],
      [3, 12, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0],
      [4, 6, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [4, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [6, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]
  );
}
