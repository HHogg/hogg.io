use hogg_circular_sequence::{PointSequence, SequenceStore};
use hogg_geometry::Point;
use hogg_spatial_grid_map::{location, SpatialGridMap};

use crate::build::Plane;

// The edge types is a unique line from a shape. It is
// determined by the shape sequence of unique shape faces
// on either side of it. As the shape types update, the
// this need updating.
#[derive(Clone, Debug)]
pub(super) struct Hash {
  pub(super) hash: String,
  pub(super) updated: bool,
  pub(super) point_sequences: SpatialGridMap<PointSequence>,
  pub(super) sequence_store: SequenceStore,
}

impl Hash {
  pub fn update(
    &mut self,
    plane: &Plane,
    is_first_run: bool,
    shape_sequence_store: &SequenceStore,
    shape_hash: &super::shape::Hash,
  ) {
    self.updated = false;

    if is_first_run {
      self.update_from_tiling(plane, shape_sequence_store);
    } else {
      self.update_from_hash(plane, shape_hash);
    }
  }

  // Here we want to determine the shape sequences that are around
  // a single edge from the plane.

  // We start from the edge midpoint point sequences which give us
  // the shape centroids on either side, which we can use to look up
  // the shape sequence and use it's index in the sequence store
  // to insert into the edge sequences.
  fn update_from_tiling(&mut self, plane: &Plane, shape_sequence_store: &SequenceStore) {
    let mut edge_sequences = SpatialGridMap::<PointSequence>::new("edge_sequences");
    let mut edge_sequence_store = SequenceStore::default();

    for point_sequence in plane.iter_core_mid_complete_point_sequences() {
      for entry in point_sequence.iter() {
        let shape_centroid = entry.point;
        let sequence_index = plane
          .get_core_center_complete_point_sequence(&shape_centroid)
          .and_then(|point_sequence| shape_sequence_store.get_index(&point_sequence.sequence))
          .map(|sequence_index| sequence_index + 1)
          .unwrap_or_else(|| 0);

        if sequence_index == 0 {
          continue;
        }

        self.update_edge_point_sequence(
          plane,
          &mut edge_sequences,
          &mut edge_sequence_store,
          &point_sequence.center, // Line segment midpoint
          &shape_centroid,        // Shape centroid
          sequence_index,
        );
      }
    }

    let hash = edge_sequence_store.to_string();

    if hash != self.hash {
      self.updated = true;
      self.hash = hash;
      self.point_sequences = edge_sequences;
      self.sequence_store = edge_sequence_store;
    }
  }

  fn update_from_hash(&mut self, _plane: &Plane, _shape_hash: &super::shape::Hash) {}

  fn update_edge_point_sequence(
    &mut self,
    _plane: &Plane,
    edge_sequences: &mut SpatialGridMap<PointSequence>,
    edge_sequence_store: &mut SequenceStore,
    edge_point: &Point,
    shape_centroid: &Point,
    sequence_index: u8,
  ) {
    let edge_location_point: location::Point = edge_point.into();

    // If we haven't seen this edge point before, let's create
    // a new point sequence to store the shape sequence indexes in
    if !edge_sequences.contains(&edge_location_point) {
      edge_sequences.insert(
        edge_location_point,
        1.0,
        None,
        PointSequence::default()
          .with_center(*edge_point)
          .with_max_size(2),
      );
    }

    let mut edge_sequence = edge_sequences
      .get_value_mut(&edge_location_point)
      .expect("Edge sequence not found");

    edge_sequence.value.insert(*shape_centroid, sequence_index);

    if edge_sequence.value.is_complete() {
      edge_sequence_store.insert(edge_sequence.value.sequence);
    }
  }
}

impl std::fmt::Display for Hash {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{}", self.hash)
  }
}

impl std::default::Default for Hash {
  fn default() -> Self {
    Hash {
      hash: String::new(),
      updated: false,
      point_sequences: SpatialGridMap::new("edge_sequences"),
      sequence_store: SequenceStore::default(),
    }
  }
}
