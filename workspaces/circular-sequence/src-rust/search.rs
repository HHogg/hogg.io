#[path = "./search_tests.rs"]
#[cfg(test)]
mod tests;

use serde::Serialize;

use crate::{get_length, is_symmetrical, reverse, Sequence};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize)]
pub enum Match {
  Partial(Sequence),
  Exact(Sequence),
  None,
}

/// Searches for a sequence in a list of sequences, and returns the first
/// sequence that either matches exactly or partially. Note that this function
/// assumes that the targets are sorted.
///
/// Space: O(1)
/// Time:  O(n * m) where n is the number of targets and m is the length of the
///        longest target.
pub fn get_match(sequence: &Sequence, targets: &Vec<Sequence>) -> Match {
  let mut first_partial_match = Match::None;

  for target in targets.iter() {
    match get_match_directional(sequence, target, false) {
      Match::Exact(sequence) => {
        return Match::Exact(sequence);
      }
      Match::Partial(sequence) => {
        if first_partial_match == Match::None {
          first_partial_match = Match::Partial(sequence);
        }
      }
      _ => {}
    }
  }

  first_partial_match
}

fn get_match_directional(source: &Sequence, target: &Sequence, reversed: bool) -> Match {
  let source_length = get_length(source);
  let target_length = get_length(target);

  if source_length > target_length {
    return Match::None;
  }

  let mut i = 0;

  for _ in 0..2 {
    for j in 0..target_length {
      if source[i] == target[j] {
        if i == target_length - 1 {
          return Match::Exact(target.clone());
        }

        if i == source_length - 1 {
          return Match::Partial(target.clone());
        }

        i = i + 1;
      } else if source[0] == target[j] {
        i = 1;
      } else {
        i = 0;
      }
    }
  }

  if !reversed && !is_symmetrical(target) {
    return get_match_directional(&reverse(source), target, true);
  }

  Match::None
}
