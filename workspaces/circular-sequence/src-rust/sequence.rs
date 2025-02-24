use typeshare::typeshare;

#[path = "./sequence_tests.rs"]
#[cfg(test)]
mod tests;

#[typeshare]
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

    length += 1;
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

        c += 1;
      } else {
        c = 0;
      }
    }
  }

  None
}

/// Returns whether a sequence is symmetrical.
///
/// Space: O(1)
/// Time:  O(n)
pub fn is_symmetrical(sequence: &Sequence) -> bool {
  get_symmetry_index(sequence).is_some()
}

/// Inserts a value into a sequence.
///
/// Space: O(1)
/// Time:  O(n)
pub fn insert(sequence: &mut Sequence, value: u8) {
  let length = get_length(sequence);

  if length == 12 {
    return;
  }

  sequence[length] = value;
}
