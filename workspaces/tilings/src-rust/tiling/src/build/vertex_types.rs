use hogg_circular_sequence::{Sequence, SequenceStore};

/// A store for the possible vertex types of a tiling.
#[derive(Clone, Debug)]
pub struct VertexTypes {
  store: SequenceStore,
}

impl VertexTypes {
  pub fn matches(&self, sequence: &Sequence) -> bool {
    matches!(
      self.store.get_match(sequence),
      hogg_circular_sequence::Match::Exact(_) | hogg_circular_sequence::Match::Partial(_)
    )
  }

  pub fn matches_exactly(&self, sequence: &Sequence) -> bool {
    matches!(
      self.store.get_match(sequence),
      hogg_circular_sequence::Match::Exact(_)
    )
  }
}

impl Default for VertexTypes {
  fn default() -> Self {
    Self {
      store: SequenceStore::from(vec![
        [3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0],
        [4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0],
        [6, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 3, 3, 3, 6, 0, 0, 0, 0, 0, 0, 0],
        [3, 3, 3, 4, 4, 0, 0, 0, 0, 0, 0, 0],
        [3, 3, 4, 3, 4, 0, 0, 0, 0, 0, 0, 0],
        [3, 3, 4, 12, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 4, 3, 12, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 3, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 6, 3, 6, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 4, 4, 6, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 4, 6, 4, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 12, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [4, 6, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [4, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ]),
    }
  }
}
