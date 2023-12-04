use num_bigint::BigInt;

#[path = "./sequence_tests.rs"]
#[cfg(test)]
mod tests;

pub type Sequence = [u8; 12];

fn sequence_to_value(sequence: &Sequence) -> BigInt {
  sequence
    .iter()
    .filter(|v| **v != 0)
    .map(|v| v.to_string())
    .collect::<Vec<_>>()
    .join("")
    .parse::<BigInt>()
    .unwrap()
}

pub fn sequence_from_string(sequence: &str) -> Sequence {
  let mut sequence = sequence
    .split('.')
    .map(|c| c.parse::<u8>().unwrap())
    .collect::<Vec<_>>();

  sequence.resize(12, 0);
  sequence.try_into().unwrap()
}

pub fn sequence_min_permutation(sequence: &Sequence) -> Sequence {
  let mut min_sequence = sequence.clone();
  let mut min_sequence_value = sequence_to_value(sequence);

  for direction in [true, false] {
    for index in 0..sequence_length(sequence) {
      let rotated_pattern = sequence_rotate(&sequence, index, direction);
      let rotated_pattern_value = sequence_to_value(&rotated_pattern);

      if rotated_pattern_value < min_sequence_value {
        min_sequence = rotated_pattern;
        min_sequence_value = rotated_pattern_value;
      }
    }
  }

  min_sequence
}

// A bidirectional pattern is one that starting
// at any point and going in one direction.
// Whatever path has been taken, can be taken
// in the opposite direction.
pub fn sequence_is_bidirectional(sequence: &Sequence) -> bool {
  for i in 0..sequence_length(sequence) {
    if &sequence_rotate(sequence, i, false) == sequence {
      return true;
    }
  }

  false
}

pub fn sequence_rotate(sequence: &Sequence, start_index: usize, forwards: bool) -> Sequence {
  let mut reordered = Sequence::default();
  let sequence_length = sequence_length(sequence);
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

pub fn sequence_reverse(sequence: &Sequence) -> Sequence {
  sequence_rotate(sequence, sequence_length(sequence) - 1, false)
}

pub fn sequence_length(sequence: &Sequence) -> usize {
  sequence.iter().position(|&x| x == 0).unwrap_or(12)
}

pub fn sequences_to_sorted_strings(sequences: &Vec<Sequence>) -> Vec<String> {
  let mut sequences_as_string = sequences
    .iter()
    .map(sequence_to_string)
    .collect::<Vec<String>>();

  sequences_as_string.sort();
  sequences_as_string
}

pub fn sequences_to_string(sequences: &Vec<Sequence>) -> String {
  flatten_duplicates(&sequences_to_sorted_strings(sequences), Some(("(", ")"))).join("; ")
}

pub fn sequence_to_string(sequence: &Sequence) -> String {
  flatten_duplicates(
    &sequence_min_permutation(sequence)
      .iter()
      .map(|&x| x.to_string())
      .collect::<Vec<String>>(),
    None,
  )
  .join(".")
}

fn flatten_duplicates(content: &Vec<String>, wrapper: Option<(&str, &str)>) -> Vec<String> {
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
          get_super_script(count)
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

const SUPERSCRIPT_DIGITS: [char; 10] = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];

fn get_super_script(n: usize) -> String {
  let mut n = n;
  let mut result = String::new();

  while n > 0 {
    result.push(SUPERSCRIPT_DIGITS[n % 10]);
    n /= 10;
  }

  result
}
