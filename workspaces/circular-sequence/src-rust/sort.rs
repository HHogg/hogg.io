use crate::Sequence;

#[path = "./sort_tests.rs"]
#[cfg(test)]
mod tests;

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
    }

    if a < b || a == 0 {
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
