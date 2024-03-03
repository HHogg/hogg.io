// use pretty_assertions::assert_eq;

use super::*;

#[test]
fn get_length_returns_correct_values() {
  assert_eq!(get_length(&[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), 0);
  assert_eq!(get_length(&[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), 1);
  assert_eq!(get_length(&[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), 2);
  assert_eq!(get_length(&[1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]), 3);
  assert_eq!(get_length(&[1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0]), 4);
  assert_eq!(get_length(&[1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0]), 5);
  assert_eq!(get_length(&[1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0]), 6);
  assert_eq!(get_length(&[1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0]), 7);
  assert_eq!(get_length(&[1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0]), 8);
  assert_eq!(get_length(&[1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0]), 9);
  assert_eq!(get_length(&[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0]), 10);
  assert_eq!(get_length(&[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0]), 11);
  assert_eq!(get_length(&[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]), 12);
}

#[test]
fn reverse_flips_sequences() {
  assert_eq!(
    reverse(&[1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    [3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  );
}

#[test]
fn is_symmetrical_returns_true_for_symmetrical_sequences() {
  assert!(is_symmetrical(&[3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0]));
  assert!(is_symmetrical(&[4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0]));
  assert!(is_symmetrical(&[6, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
  assert!(is_symmetrical(&[3, 3, 3, 3, 6, 0, 0, 0, 0, 0, 0, 0]));
  assert!(is_symmetrical(&[3, 3, 3, 4, 4, 0, 0, 0, 0, 0, 0, 0]));
  assert!(is_symmetrical(&[3, 3, 4, 3, 4, 0, 0, 0, 0, 0, 0, 0]));
  assert!(is_symmetrical(&[3, 4, 3, 12, 0, 0, 0, 0, 0, 0, 0, 0]));
  assert!(is_symmetrical(&[3, 3, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0]));
  assert!(is_symmetrical(&[3, 6, 3, 6, 0, 0, 0, 0, 0, 0, 0, 0]));
  assert!(is_symmetrical(&[3, 4, 6, 4, 0, 0, 0, 0, 0, 0, 0, 0]));
  assert!(is_symmetrical(&[3, 12, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
  assert!(is_symmetrical(&[4, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
}

#[test]
fn is_symmetrical_returns_false_for_asymmetrical_sequences() {
  assert!(!is_symmetrical(&[3, 3, 4, 12, 0, 0, 0, 0, 0, 0, 0, 0]));
  assert!(!is_symmetrical(&[3, 4, 4, 6, 0, 0, 0, 0, 0, 0, 0, 0]));
  assert!(!is_symmetrical(&[4, 6, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
  assert!(!is_symmetrical(&[4, 6, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0]));

  // Covers a case where the inverse appears in the sequence but with
  // other shapes in between
  assert!(!is_symmetrical(&[3, 4, 4, 6, 4, 3, 0, 0, 0, 0, 0, 0]));
}

#[test]
fn get_min_for_symmetrical_sequence() {
  assert_eq!(
    get_min_permutation(&[4, 6, 4, 3, 0, 0, 0, 0, 0, 0, 0, 0]),
    [3, 4, 6, 4, 0, 0, 0, 0, 0, 0, 0, 0]
  );
}

#[test]
fn get_min_for_asymmetrical_sequence() {
  assert_eq!(
    get_min_permutation(&[6, 12, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    [4, 6, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  );
}

#[test]
fn get_min_for_reversed_asymmetrical_sequence() {
  assert_eq!(
    get_min_permutation(&[4, 12, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    [4, 6, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  );
}
