use super::*;

#[test]
fn lengths_of_sequence() {
  assert_eq!(sequence_length(&[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), 0);
  assert_eq!(sequence_length(&[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), 1);
  assert_eq!(sequence_length(&[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), 2);
  assert_eq!(sequence_length(&[1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]), 3);
  assert_eq!(sequence_length(&[1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0]), 4);
  assert_eq!(sequence_length(&[1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0]), 5);
  assert_eq!(sequence_length(&[1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0]), 6);
  assert_eq!(sequence_length(&[1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0]), 7);
  assert_eq!(sequence_length(&[1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0]), 8);
  assert_eq!(sequence_length(&[1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0]), 9);
  assert_eq!(sequence_length(&[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0]), 10);
  assert_eq!(sequence_length(&[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0]), 11);
  assert_eq!(sequence_length(&[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]), 12);
}

#[test]
fn rotates_sequences() {
  assert_eq!(
    sequence_rotate(&[1, 2, 3, 4, 5, 0, 0, 0, 0, 0, 0, 0], 2, true),
    [3, 4, 5, 1, 2, 0, 0, 0, 0, 0, 0, 0]
  );
  assert_eq!(
    sequence_rotate(&[1, 2, 3, 4, 5, 0, 0, 0, 0, 0, 0, 0], 2, false),
    [3, 2, 1, 5, 4, 0, 0, 0, 0, 0, 0, 0]
  );
}

#[test]
fn reverses_sequences() {
  assert_eq!(
    sequence_reverse(&[1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    [3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  );
}

#[test]
fn identifies_bidirectional_sequences() {
  assert_eq!(
    sequence_is_bidirectional(&[3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0]),
    true
  );
  assert_eq!(
    sequence_is_bidirectional(&[4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0]),
    true
  );
  assert_eq!(
    sequence_is_bidirectional(&[6, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    true
  );
  assert_eq!(
    sequence_is_bidirectional(&[3, 3, 3, 3, 6, 0, 0, 0, 0, 0, 0, 0]),
    true
  );
  assert_eq!(
    sequence_is_bidirectional(&[3, 3, 3, 4, 4, 0, 0, 0, 0, 0, 0, 0]),
    true
  );
  assert_eq!(
    sequence_is_bidirectional(&[3, 3, 4, 3, 4, 0, 0, 0, 0, 0, 0, 0]),
    true
  );
  assert_eq!(
    sequence_is_bidirectional(&[3, 4, 3, 12, 0, 0, 0, 0, 0, 0, 0, 0]),
    true
  );
  assert_eq!(
    sequence_is_bidirectional(&[3, 3, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0]),
    true
  );
  assert_eq!(
    sequence_is_bidirectional(&[3, 6, 3, 6, 0, 0, 0, 0, 0, 0, 0, 0]),
    true
  );
  assert_eq!(
    sequence_is_bidirectional(&[3, 4, 6, 4, 0, 0, 0, 0, 0, 0, 0, 0]),
    true
  );
  assert_eq!(
    sequence_is_bidirectional(&[3, 12, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    true
  );
  assert_eq!(
    sequence_is_bidirectional(&[4, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    true
  );
}

#[test]
fn identifies_non_bidirectional_sequences() {
  assert_eq!(
    sequence_is_bidirectional(&[3, 3, 4, 12, 0, 0, 0, 0, 0, 0, 0, 0]),
    false
  );
  assert_eq!(
    sequence_is_bidirectional(&[3, 4, 4, 6, 0, 0, 0, 0, 0, 0, 0, 0]),
    false
  );
  assert_eq!(
    sequence_is_bidirectional(&[4, 6, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    false
  );
}

#[test]
fn finds_the_min_permutation() {
  // Forwards
  assert_eq!(
    sequence_to_string(&sequence_min_permutation(&[
      2, 6, 5, 6, 6, 0, 0, 0, 0, 0, 0, 0
    ])),
    String::from("2.6.5.6²")
  );

  assert_eq!(
    sequence_to_string(&sequence_min_permutation(&[
      6, 2, 6, 5, 6, 0, 0, 0, 0, 0, 0, 0
    ])),
    String::from("2.6.5.6²"),
  );

  assert_eq!(
    sequence_to_string(&sequence_min_permutation(&[
      6, 6, 2, 6, 5, 0, 0, 0, 0, 0, 0, 0
    ])),
    String::from("2.6.5.6²"),
  );

  assert_eq!(
    sequence_to_string(&sequence_min_permutation(&[
      5, 6, 6, 2, 6, 0, 0, 0, 0, 0, 0, 0
    ])),
    String::from("2.6.5.6²"),
  );

  assert_eq!(
    sequence_to_string(&sequence_min_permutation(&[
      6, 5, 6, 6, 2, 0, 0, 0, 0, 0, 0, 0
    ])),
    String::from("2.6.5.6²"),
  );

  // Backwards
  assert_eq!(
    sequence_to_string(&sequence_min_permutation(&[
      2, 6, 6, 5, 6, 0, 0, 0, 0, 0, 0, 0
    ])),
    String::from("2.6.5.6²")
  );
}

#[test]
fn flattens_a_pattern_to_string() {
  assert_eq!(
    sequence_to_string(&[3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0]),
    "3⁶"
  );
  assert_eq!(
    sequence_to_string(&[4, 4, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0]),
    "4².6²"
  );
}

#[test]
fn flattens_multiple_patterns_to_string() {
  assert_eq!(
    sequences_to_string(&vec![
      [3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0],
      [3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0],
      [4, 4, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0]
    ]),
    "(3⁶)²; 4².6²"
  );
}
