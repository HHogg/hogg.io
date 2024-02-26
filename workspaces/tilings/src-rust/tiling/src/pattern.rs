#[path = "./pattern_tests.rs"]
#[cfg(test)]
mod tests;

use std::collections::HashSet;
use std::fmt::Display;
use std::hash::Hash;

use circular_sequence::{self, Sequence};
use serde::Serialize;

use crate::r#match::Match;
use crate::TilingError;

#[derive(Clone, Debug, Default, Serialize)]
#[serde(into = "Vec<String>")]
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
    write!(f, "{}", circular_sequence::to_string(self.clone().into()))
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
    circular_sequence::sort(self.into())
      .iter()
      .map(|s| circular_sequence::to_string(vec![*s]))
      .collect()
  }
}

impl Into<String> for Patterns {
  fn into(self) -> String {
    self.to_string()
  }
}

#[derive(Clone, Copy, Default, Debug, Serialize)]
pub struct Pattern(Sequence);

impl Pattern {
  pub fn sequence(&self) -> &Sequence {
    &self.0
  }

  pub fn len(&self) -> usize {
    circular_sequence::length(self.sequence())
  }

  pub fn rev(&self) -> Self {
    Self(circular_sequence::reverse(&self.sequence()))
  }

  pub fn insert(&mut self, value: u8) -> Result<(), TilingError> {
    let next_index = circular_sequence::length(self.sequence());

    if next_index == 6 {
      return Err(TilingError::Application {
        reason: "Pattern overflow".into(),
      });
    }

    self.0[next_index] = value;

    Ok(())
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

impl Into<Sequence> for Pattern {
  fn into(self) -> Sequence {
    self.0
  }
}

impl Into<String> for Pattern {
  fn into(self) -> String {
    circular_sequence::to_string(vec![self.sequence().clone()])
  }
}

impl Hash for Pattern {
  fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
    let min_sequence = circular_sequence::min(self.0);

    min_sequence.hash(state);
  }
}

impl PartialEq for Pattern {
  fn eq(&self, other: &Self) -> bool {
    circular_sequence::compare(
      &circular_sequence::min(self.0),
      &circular_sequence::min(other.0),
    ) == std::cmp::Ordering::Equal
  }
}

impl Eq for Pattern {}
