use crate::super_script;

#[path = "./sequence_tests.rs"]
#[cfg(test)]
mod tests;

pub type Sequence = [u8; 12];

/// Returns the length of a sequence.
pub fn length(sequence: &Sequence) -> usize {
  sequence.iter().position(|&x| x == 0).unwrap_or(12)
}

/// Rotates a sequence from the start index in the given direction.
fn rotate(sequence: &Sequence, start_index: usize, forwards: bool) -> Sequence {
  let mut reordered = Sequence::default();
  let sequence_length = length(sequence);
  let mut index: usize = start_index;
  let mut count: usize = 0;

  while count < sequence_length {
    reordered[count] = sequence[index];

    if forwards {
      index = (index + 1) % sequence_length;
    } else {
      index = (index + sequence_length - 1) % sequence_length;
    }

    count += 1;
  }

  reordered
}

/// Reverses a sequence.
pub fn reverse(sequence: &Sequence) -> Sequence {
  rotate(sequence, length(sequence) - 1, false)
}

/// A bidirectional pattern is one that starting
/// at any point and going in one direction.
/// Whatever path has been taken, can be taken
/// in the opposite direction.
pub fn is_bidirectional(sequence: &Sequence) -> bool {
  for i in 0..length(sequence) {
    if &rotate(sequence, i, false) == sequence {
      return true;
    }
  }

  false
}

/// Returns the minimum rotational permutation of a sequence.
pub fn min(sequence: Sequence) -> Sequence {
  let mut min_sequence = sequence.clone();

  for direction in [true, false] {
    for index in 0..length(&sequence) {
      let rotated_sequence = rotate(&sequence, index, direction);

      if compare(&min_sequence, &rotated_sequence) == std::cmp::Ordering::Greater {
        min_sequence = rotated_sequence;
      }
    }
  }

  min_sequence
}

/// Compares two sequences.
pub fn compare(a: &Sequence, b: &Sequence) -> std::cmp::Ordering {
  for i in 0..12 {
    let a = a[i];
    let b = b[i];

    if a == b {
      continue;
    }

    if a > b || b == 0 {
      return std::cmp::Ordering::Greater;
    } else if a < b || a == 0 {
      return std::cmp::Ordering::Less;
    }
  }

  std::cmp::Ordering::Equal
}

/// Sorts a list of sequences.
pub fn sort(mut sequences: Vec<Sequence>) -> Vec<Sequence> {
  sequences.sort_by(compare);
  sequences
}

/// Converts a sequence to a string.
pub fn to_string(sequences: Vec<Sequence>) -> String {
  flatten_duplicates(
    sort(sequences.clone())
      .iter()
      .copied()
      .map(to_string_one)
      .collect(),
    Some(("(", ")")),
  )
  .join("; ")
}

///
fn to_string_one(sequence: Sequence) -> String {
  flatten_duplicates(
    min(sequence)
      .iter()
      .map(|&x| x.to_string())
      .collect::<Vec<String>>(),
    None,
  )
  .join(".")
}

///
fn flatten_duplicates(content: Vec<String>, wrapper: Option<(&str, &str)>) -> Vec<String> {
  let (prefix, suffix) = wrapper.unwrap_or(("", ""));
  let mut flattened_content: Vec<String> = Vec::new();
  let mut index = 0;
  let mut count = 1;

  if content.len() == 0 {
    return vec![];
  }

  loop {
    let current = &content[index];
    let next = content.get(index + 1);

    if next.is_none() || current != next.unwrap() {
      if count > 1 {
        flattened_content.push(format!(
          "{prefix}{current}{suffix}{}",
          super_script::get(count)
        ));
      } else {
        flattened_content.push(current.to_string());
      }

      count = 1;
    } else {
      count += 1;
    }

    index += 1;

    if next.is_none() || next.unwrap() == "0" {
      break;
    }
  }

  flattened_content
}
