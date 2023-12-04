#[path = "./pattern_tests.rs"]
#[cfg(test)]
mod tests;

use std::collections::HashSet;
use std::fmt::Display;
use std::hash::Hash;

use serde::{Deserialize, Serialize};

use crate::r#match::Match;
use crate::sequence::{
  sequence_from_string,
  sequence_length,
  sequence_min_permutation,
  sequence_reverse,
  sequence_to_string,
  sequences_to_sorted_strings,
  sequences_to_string,
  Sequence,
};
use crate::TilingError;

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(into = "Vec<String>", from = "Vec<String>")]
pub struct Patterns {
  patterns: Vec<Pattern>,
}

impl Patterns {
  pub fn new(sequences: &[Sequence]) -> Self {
    Self {
      patterns: sequences.iter().map(|s| Pattern(*s)).collect(),
    }
  }

  /// Inserts the pattern returning the index of the pattern.
  pub fn insert_pattern(&mut self, pattern: Pattern) -> u8 {
    if let Some(index) = self.index_of(&pattern) {
      index
    } else {
      self.patterns.push(pattern);
      (self.patterns.len() - 1) as u8
    }
  }

  pub fn insert_sequence(&mut self, sequence: Sequence) -> u8 {
    self.insert_pattern(Pattern(sequence))
  }

  pub fn get_match(&self, pattern: &Pattern) -> Match {
    Match::from(&pattern.clone().into(), &self.clone().into())
  }

  pub fn len(&self) -> usize {
    self.patterns.len()
  }

  pub fn is_empty(&self) -> bool {
    self.patterns.is_empty()
  }

  pub fn index_of(&self, pattern: &Pattern) -> Option<u8> {
    self
      .patterns
      .iter()
      .position(|p| *p == *pattern)
      .map(|i| i as u8)
  }
}

impl Display for Patterns {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{}", sequences_to_string(&self.clone().into()))
  }
}

impl From<Vec<String>> for Patterns {
  fn from(strings: Vec<String>) -> Self {
    Self {
      patterns: strings.into_iter().map(|s| s.into()).collect(),
    }
  }
}

impl Into<HashSet<Sequence>> for Patterns {
  fn into(self) -> HashSet<Sequence> {
    self.patterns.into_iter().map(|p| p.into()).collect()
  }
}

impl Into<Vec<Sequence>> for Patterns {
  fn into(self) -> Vec<Sequence> {
    self.patterns.into_iter().map(|p| p.into()).collect()
  }
}

impl Into<Vec<String>> for Patterns {
  fn into(self) -> Vec<String> {
    sequences_to_sorted_strings(&self.clone().into())
  }
}

impl Into<String> for Patterns {
  fn into(self) -> String {
    self.to_string()
  }
}

#[derive(Clone, Copy, Default, Debug, Deserialize, Serialize)]
pub struct Pattern(Sequence);

impl Pattern {
  pub fn sequence(&self) -> &Sequence {
    &self.0
  }

  pub fn len(&self) -> usize {
    sequence_length(self.sequence())
  }

  pub fn rev(&self) -> Self {
    Self(sequence_reverse(&self.sequence()))
  }

  pub fn insert(&mut self, value: u8) -> Result<(), TilingError> {
    let next_index = sequence_length(self.sequence());

    if next_index == 6 {
      return Err(TilingError::Application {
        reason: "Pattern overflow".into(),
      });
    }

    self.0[next_index] = value;

    Ok(())
  }

  pub fn min_permutation(&self) -> Self {
    Self(sequence_min_permutation(&self.sequence()))
  }
}

impl FromIterator<u8> for Pattern {
  fn from_iter<T: IntoIterator<Item = u8>>(iter: T) -> Self {
    let mut sequence = Sequence::default();

    for (index, value) in iter.into_iter().enumerate() {
      sequence[index] = value as u8;
    }

    Self(sequence)
  }
}

impl From<Sequence> for Pattern {
  fn from(sequence: Sequence) -> Self {
    Self(sequence)
  }
}

impl From<String> for Pattern {
  fn from(string: String) -> Self {
    sequence_from_string(&string).into()
  }
}

impl Into<Sequence> for Pattern {
  fn into(self) -> Sequence {
    self.0
  }
}

impl Into<String> for Pattern {
  fn into(self) -> String {
    sequence_to_string(self.sequence())
  }
}

impl Hash for Pattern {
  fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
    let min_sequence = sequence_min_permutation(&self.0);

    min_sequence.hash(state);
  }
}

impl PartialEq for Pattern {
  fn eq(&self, other: &Self) -> bool {
    let min_self = sequence_min_permutation(&self.0);
    let min_other = sequence_min_permutation(&other.0);

    min_self == min_other
  }
}

impl Eq for Pattern {}
