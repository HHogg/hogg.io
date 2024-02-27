#[path = "./min_permutation_tests.rs"]
#[cfg(test)]
mod tests;

use crate::get_match::Direction;
use crate::{compare, get_length, is_symmetrical, Sequence};

/// Returns the minimum permutation of a sequence.
///
/// Space: O(1)
/// Time: O(n^2)
pub fn get_min_permutation(sequence: &Sequence) -> Sequence {
  get_min_permutation_directional(sequence, Direction::Forward)
}

/// Returns the minimum permutation of a sequence with
/// the option to reverse the sequence.
///
/// Space: O(1)
/// Time: O(n^2)
fn get_min_permutation_directional(sequence: &Sequence, direction: Direction) -> Sequence {
  let length = get_length(sequence);
  let mut a = sequence.clone();

  for i in 0..length {
    let b = shift_left(&sequence, i);

    if compare(&a, &b) == std::cmp::Ordering::Greater {
      a = b;
    }
  }

  if direction == Direction::Forward && !is_symmetrical(sequence) {
    let b = get_min_permutation_directional(&reverse(sequence), Direction::Backward);

    if compare(&a, &b) == std::cmp::Ordering::Greater {
      a = b;
    }
  }

  a
}

/// Shifts a sequence to the left and inserts the
/// last value at the beginning.
///
/// Space: O(1)
/// Time:  O(n)
fn shift_left(sequence: &Sequence, shift: usize) -> Sequence {
  let length = get_length(sequence);
  let mut shifted_sequence = Sequence::default();

  for i in 0..length {
    let j = (i + shift) % length;
    shifted_sequence[i] = sequence[j];
  }

  shifted_sequence
}

/// Reverses a sequence
///
/// Space: O(1)
/// Time:  O(n)
pub fn reverse(sequence: &Sequence) -> Sequence {
  let mut reversed_sequence = Sequence::default();
  let length = get_length(sequence);

  for i in 0..length {
    reversed_sequence[i] = sequence[length - 1 - i];
  }

  reversed_sequence
}
