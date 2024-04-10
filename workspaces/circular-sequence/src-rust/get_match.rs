#[path = "./get_match_tests.rs"]
#[cfg(test)]
mod get_match_tests;

use serde::Serialize;

use crate::{get_length, is_symmetrical, reverse, Sequence};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize)]
pub enum Match {
  Exact(usize),
  Partial(usize),
  None,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize)]
pub enum Direction {
  Forward,
  Backward,
}

/// Searches for a sequence in a list of sequences, and returns the first
/// sequence that either matches exactly or partially. Note that this function
/// assumes that the targets are sorted.
///
/// Space: O(1)
/// Time:  O(n + m) where n is the number of targets and m is the length of the
///        longest target.
pub fn get_match(sequence: &Sequence, targets: &[Sequence]) -> Match {
  let mut first_partial_match = Match::None;

  for (index, target) in targets.iter().enumerate() {
    match get_match_directional(sequence, target, Direction::Forward) {
      Match::Exact(_) => {
        return Match::Exact(index);
      }
      Match::Partial(_) => {
        if matches!(first_partial_match, Match::None) {
          first_partial_match = Match::Partial(index);
        }
      }
      _ => {}
    }
  }

  first_partial_match
}

// Searches for a sequence in a list of sequences, and returns the first
// sequence that either matches exactly or partially. This function uses
// the Knuth-Morris-Pratt algorithm to search for the sequence in the target,
// wrapping around the target to match offset starting points. It will search
// in both directions if the target is not symmetrical.
//
// Space: O(n)
// Time:  O(n + m)
fn get_match_directional(source: &Sequence, target: &Sequence, direction: Direction) -> Match {
  let source_length = get_length(source);
  let target_length = get_length(target);
  let source_lps = get_lps(source);

  if source_length > target_length {
    return Match::None;
  }

  let mut target_i = 0;
  let mut source_i = 0;

  while target_i < target_length * 2 {
    if source[source_i] == target[target_i % target_length] {
      target_i += 1;
      source_i += 1;
    } else if source_i != 0 {
      source_i = source_lps[source_i - 1] as usize;
    } else {
      target_i += 1;
    }

    if source_i == source_length {
      if source_i == target_length {
        return Match::Exact(0);
      }

      return Match::Partial(0);
    }
  }

  if direction == Direction::Forward && !is_symmetrical(target) {
    return get_match_directional(&reverse(source), target, Direction::Backward);
  }

  Match::None
}

// Creates a KMP longest prefix suffix array
//
// Space: O(n)
// Time:  O(n)
fn get_lps(sequence: &Sequence) -> Sequence {
  let length = get_length(sequence);
  let mut lps = Sequence::default();

  let mut l = 0;
  let mut r = 1;

  // The first element is always 0, as there
  // are no prefixes or suffixes
  lps[0] = 0;

  while r < length {
    if sequence[l] == sequence[r] {
      lps[r] = (l + 1) as u8;
      l += 1;
      r += 1;
    } else if l != 0 {
      l = lps[l - 1] as usize;
    } else {
      lps[r] = 0;
      r += 1;
    }
  }

  lps
}
