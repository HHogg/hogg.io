use hogg_circular_sequence::SequenceStore;
use serde::{Serialize, Serializer};

use crate::Tiling;

mod edge;
mod shape;
mod vertex;

#[derive(Clone, Debug, Default)]
pub struct Hash {
  vertex_hash: vertex::Hash,
  edge_hash: edge::Hash,
  shape_hash: shape::Hash,
}

impl Hash {
  pub fn build(
    tiling: &Tiling,
    vertex_sequence_store: &SequenceStore,
    edge_sequence_store: &SequenceStore,
    shape_sequence_store: &SequenceStore,
  ) -> Self {
    let mut hash = Hash::default();
    let mut first_run = true;

    while first_run || hash.vertex_hash.updated || hash.edge_hash.updated || hash.shape_hash.updated
    {
      hash
        .vertex_hash
        .update(tiling, &first_run, edge_sequence_store);
      hash
        .edge_hash
        .update(tiling, &first_run, shape_sequence_store);
      hash
        .shape_hash
        .update(tiling, &first_run, vertex_sequence_store);

      first_run = false;
    }

    hash
  }
}

impl std::fmt::Display for Hash {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(
      f,
      "{}/{}/{}",
      self.vertex_hash, self.edge_hash, self.shape_hash
    )
  }
}

impl Serialize for Hash {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
    S: Serializer,
  {
    serializer.serialize_str(&self.to_string())
  }
}
