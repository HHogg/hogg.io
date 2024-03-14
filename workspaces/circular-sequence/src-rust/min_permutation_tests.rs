use super::*;

#[test]
fn reverse_flips_sequences() {
  assert_eq!(
    reverse(&[1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    [3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  );
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
