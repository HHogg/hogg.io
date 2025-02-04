use hogg_circular_sequence::SequenceStore;
use hogg_geometry::Point;
use hogg_spatial_grid_map::{location, SpatialGridMap};

use crate::{build::PointSequence, Tiling};

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
    tiling: &Tiling,
    first_run: &bool,
    shape_sequence_store: &SequenceStore,
  ) {
    self.updated = false;

    if *first_run {
      self.update_from_plane(tiling, shape_sequence_store);
    } else {
      self.update_from_hashes(tiling);
    }
  }

  // Here we want to determine the shape sequences that are around
  // a single edge from the plane.

  // We start from the edge midpoint point sequences which give us
  // the shape centroids on either side, which we can use to look up
  // the shape sequence and use it's index in the sequence store
  // to insert into the edge sequences.
  fn update_from_plane(&mut self, tiling: &Tiling, shape_sequence_store: &SequenceStore) {
    let mut edge_sequences = SpatialGridMap::<PointSequence>::new("edge_sequences");
    let mut edge_sequence_store = SequenceStore::default();

    for sequence in tiling.plane.iter_core_mid_complete_point_sequences() {
      if !sequence.is_complete() {
        continue;
      }

      for entry in sequence.iter() {
        let sequence_index = tiling
          .plane
          .get_core_center_complete_point_sequence(&entry.point)
          .and_then(|point_sequence| shape_sequence_store.get_index(&point_sequence.sequence))
          .map(|sequence_index| sequence_index + 1)
          .unwrap_or_else(|| 0);

        if sequence_index == 0 {
          continue;
        }

        self.update_edge_point_sequence(
          &mut edge_sequences,
          &mut edge_sequence_store,
          &sequence.center, // Line segment midpoint
          &entry.point,     // Shape centroid
          sequence_index,
        );
      }
    }

    self.updated = true;
    self.point_sequences = edge_sequences;
    self.sequence_store = edge_sequence_store;
    self.hash = self.sequence_store.to_string();
  }

  fn update_from_hashes(&mut self, _tiling: &Tiling) {}

  fn update_edge_point_sequence(
    &mut self,
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
          .with_size(2),
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
