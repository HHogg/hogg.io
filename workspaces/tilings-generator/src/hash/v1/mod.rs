mod edge;
mod shape;
mod vertex;

use serde::{Serialize, Serializer};

use super::Hash;
use crate::build::Plane;

#[derive(Clone, Debug, Default)]
pub struct HashV1 {
  iterations: u32,
  vertex_hash: vertex::Hash,
  edge_hash: edge::Hash,
  shape_hash: shape::Hash,
}

impl Hash for HashV1 {
  fn build(plane: &Plane) -> Self {
    let mut hash = HashV1::default();

    while hash.iterations == 0
      || hash.vertex_hash.updated
      || hash.edge_hash.updated
      || hash.shape_hash.updated
    {
      let is_first_run = hash.iterations == 0;

      hash
        .vertex_hash
        .update(plane, is_first_run, &plane.edge_types, &hash.edge_hash);

      hash
        .edge_hash
        .update(plane, is_first_run, &plane.shape_types, &hash.shape_hash);

      hash
        .shape_hash
        .update(plane, is_first_run, &plane.vertex_types, &hash.vertex_hash);

      hash.iterations += 1;
    }

    hash
  }
}

impl std::fmt::Display for HashV1 {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(
      f,
      "{}/{}/{}",
      self.vertex_hash, self.edge_hash, self.shape_hash
    )
  }
}

impl Serialize for HashV1 {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
    S: Serializer,
  {
    serializer.serialize_str(&self.to_string())
  }
}
