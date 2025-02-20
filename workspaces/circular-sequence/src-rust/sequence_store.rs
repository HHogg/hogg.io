#[path = "./sequence_store_tests.rs"]
#[cfg(test)]
mod tests;

use std::fmt::{self, Display, Formatter};

use serde::Serialize;

use crate::to_string::{to_string, to_string_one};
use crate::{compare, get_match, get_min_permutation, sort, Match, Sequence};

#[derive(Clone, Debug, Default, Serialize)]
#[serde(into = "Vec<String>")]
pub struct SequenceStore {
  sequences: Vec<Sequence>,
}

impl SequenceStore {
  pub fn get(&self, index: u8) -> Option<&Sequence> {
    self.sequences.get(index as usize)
  }

  pub fn get_index(&self, sequence: &Sequence) -> Option<u8> {
    match self.get_match(sequence) {
      Match::Exact(index) => Some(index),
      _ => None,
    }
  }

  pub fn get_match(&self, sequence: &Sequence) -> Match {
    get_match(sequence, &self.sequences)
  }

  pub fn insert(&mut self, sequence: Sequence) -> bool {
    match self.get_match(&sequence) {
      Match::Exact(_) => false,
      _ => {
        self.sequences.push(get_min_permutation(&sequence));
        self.sequences.sort_by(compare);
        true
      }
    }
  }
}

impl Display for SequenceStore {
  fn fmt(&self, f: &mut Formatter) -> fmt::Result {
    write!(f, "{}", to_string(self.sequences.clone()))
  }
}

impl From<Vec<Sequence>> for SequenceStore {
  fn from(sequences: Vec<Sequence>) -> Self {
    let mut sequence_store = Self::default();

    for sequence in sequences {
      sequence_store.insert(sequence);
    }

    sequence_store
  }
}

impl From<SequenceStore> for Vec<Sequence> {
  fn from(store: SequenceStore) -> Self {
    store.sequences
  }
}

impl From<SequenceStore> for Vec<String> {
  fn from(store: SequenceStore) -> Self {
    sort(store.sequences)
      .iter()
      .map(|s| to_string_one(*s))
      .collect()
  }
}
