#[path = "./sequence_store_tests.rs"]
#[cfg(test)]
mod tests;

use std::fmt::{self, Display, Formatter};

use serde::Serialize;

use crate::{get_match, to_string, Match, Sequence};

#[derive(Clone, Debug, Default, Serialize)]
#[serde(into = "Vec<String>")]
pub struct SequenceStore {
  sequences: Vec<Sequence>,
}

impl SequenceStore {
  pub fn get(&self, index: u8) -> Option<&Sequence> {
    self.sequences.get(index as usize)
  }

  pub fn get_match(&self, sequence: &Sequence) -> Match {
    get_match(sequence, &self.sequences)
  }

  pub fn insert(&mut self, sequence: Sequence) -> u8 {
    match self.get_match(&sequence) {
      Match::Exact(index) => index,
      _ => {
        let index = self.sequences.len();
        self.sequences.push(sequence);
        index as u8
      }
    }
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
    store
      .sequences
      .iter()
      .map(|s| to_string(vec![*s]))
      .collect()
  }
}

impl Display for SequenceStore {
  fn fmt(&self, f: &mut Formatter) -> fmt::Result {
    write!(f, "{}", to_string(self.sequences.clone()))
  }
}
