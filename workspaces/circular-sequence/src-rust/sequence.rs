use crate::compare;

#[path = "./sequence_tests.rs"]
#[cfg(test)]
mod tests;

pub type Sequence = [u8; 12];

/// Returns the length of a sequence.
///
/// Space: O(1)
/// Time:  O(n)
pub fn get_length(sequence: &Sequence) -> usize {
  let mut length = 0;

  for value in sequence {
    if *value == 0 {
      return length;
    }

    length = length + 1;
  }

  length
}

/// A symmetrical sequence is one that starting
/// at any point and going in one direction.
/// Whatever path has been taken, can be taken
/// in the opposite direction.
///
/// The approach we'll take here it to loop through
/// the sequence twice, and while doing so, checking
/// if there is the appearance of the sequence in
/// it's reversed form.
///
/// Space: O(1)
/// Time:  O(n)
pub fn get_symmetry_index(sequence: &Sequence) -> Option<usize> {
  let length = get_length(sequence);
  let mut c = 0;
  let mut i = None;

  for _ in 0..2 {
    for j in 0..length {
      if sequence[j] == sequence[length - 1 - c] {
        if c == length - 1 {
          return i;
        }

        if i.is_none() {
          i = Some(j);
        }

        c = c + 1;
      } else {
        c = 0;
      }
    }
  }

  None
}

pub fn is_symmetrical(sequence: &Sequence) -> bool {
  get_symmetry_index(sequence).is_some()
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

/// Returns the minimum permutation of a sequence.
///
/// Space: O(1)
/// Time: O(n^2)
pub fn get_min_permutation(sequence: &Sequence) -> Sequence {
  get_min_permutation_directional(sequence, false)
}

/// Returns the minimum permutation of a sequence with
/// the option to reverse the sequence.
///
/// Space: O(1)
/// Time: O(n^2)
fn get_min_permutation_directional(sequence: &Sequence, reversed: bool) -> Sequence {
  let length = get_length(sequence);
  let mut a = sequence.clone();

  for i in 0..length {
    let b = shift_left_and_insert(&sequence, i);

    if compare(&a, &b) == std::cmp::Ordering::Greater {
      a = b;
    }
  }

  if !reversed && !is_symmetrical(sequence) {
    let b = get_min_permutation_directional(&reverse(sequence), true);

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
fn shift_left_and_insert(sequence: &Sequence, shift: usize) -> Sequence {
  let length = get_length(sequence);
  let mut shifted_sequence = Sequence::default();

  for i in 0..length {
    let j = (i + shift) % length;
    shifted_sequence[i] = sequence[j];
  }

  shifted_sequence
}
