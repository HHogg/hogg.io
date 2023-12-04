#[path = "./match_tests.rs"]
#[cfg(test)]
mod tests;

use std::collections::HashSet;

use serde::Serialize;

use crate::sequence::{sequence_is_bidirectional, sequence_length, sequence_reverse, Sequence};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize)]
pub enum Match {
  Partial(Sequence),
  Exact(Sequence),
  None,
}

impl Match {
  pub fn from(source: &Sequence, targets: &HashSet<Sequence>) -> Self {
    let mut first_partial_match = Match::None;

    for target in targets.iter() {
      match match_once(source, target) {
        Some(Match::Exact(numbers)) => {
          return Match::Exact(numbers);
        }
        Some(Match::Partial(numbers)) => {
          if first_partial_match == Match::None {
            first_partial_match = Match::Partial(numbers);
          }
        }
        _ => {}
      }
    }

    first_partial_match
  }

  pub fn unwrap_exact(self) -> Sequence {
    match self {
      Match::Exact(numbers) => numbers,
      _ => panic!("Match::unwrap_exact"),
    }
  }
}

impl Default for Match {
  fn default() -> Self {
    Self::None
  }
}

fn match_once(source: &Sequence, target: &Sequence) -> Option<Match> {
  match_once_one_way(source, target, target).or_else(|| {
    if !sequence_is_bidirectional(target) {
      match_once_one_way(source, target, &sequence_reverse(target))
    } else {
      None
    }
  })
}

fn match_once_one_way(
  source: &Sequence,
  target_forwards: &Sequence,
  target: &Sequence,
) -> Option<Match> {
  let source_length = sequence_length(source);
  let target_length = sequence_length(target);

  let mut source_index = 0;
  let mut target_start_index = 0;
  let mut target_index = 0;

  if source_length > target_length {
    return None;
  }

  loop {
    let nodes_match = source[source_index] == target[target_index];
    let is_last_shape = source_index == source_length - 1;
    let next_index = if target_index == target_length - 1 {
      0
    } else {
      target_index + 1
    };

    if nodes_match {
      if is_last_shape {
        if next_index == target_start_index {
          return Some(Match::Exact(*target_forwards));
        } else {
          return Some(Match::Partial(*target_forwards));
        }
      }

      source_index += 1;
      target_index = next_index;
    } else {
      if target_start_index + 1 == target_length {
        return None;
      }

      source_index = 0;
      target_start_index += 1;
      target_index = target_start_index;
    }
  }
}
