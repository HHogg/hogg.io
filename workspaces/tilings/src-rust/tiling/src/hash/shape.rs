use circular_sequence::SequenceStore;
use spatial_grid_map::{location, SpatialGridMap};

use crate::{build::PointSequence, geometry::Point, Tiling};

// The shape types is a unique shape face. It is determined
// by the sequence of vertex types that make it up. As the
// vertex types update, this needs updating.
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
    vertex_sequence_store: &SequenceStore,
  ) {
    self.updated = false;

    if *first_run {
      self.update_from_plane(tiling, vertex_sequence_store);
    } else {
      self.update_from_hashes(tiling);
    }
  }

  fn update_from_plane(&mut self, tiling: &Tiling, vertex_sequence_store: &SequenceStore) {
    let mut shape_sequences = SpatialGridMap::<PointSequence>::new("shape_sequences");
    let mut shape_sequence_store = SequenceStore::default();

    for sequence in tiling.plane.iter_core_center_complete_point_sequences() {
      let polygon = tiling
        .plane
        .polygons
        .get_value(&sequence.center.into())
        .expect("Polygon not found");

      for vertex_point in polygon.points.iter() {
        let sequence_index = tiling
          .plane
          .get_core_end_complete_point_sequence(vertex_point)
          .and_then(|point_sequence| vertex_sequence_store.get_index(&point_sequence.sequence))
          .map(|sequence_index| sequence_index + 1)
          .unwrap_or_else(|| 0);

        if sequence_index == 0 {
          continue;
        }

        self.update_shape_point_sequence(
          &mut shape_sequences,
          &mut shape_sequence_store,
          &polygon.centroid,
          &polygon.points.len(),
          vertex_point,
          sequence_index,
        );
      }
    }

    self.updated = true;
    self.point_sequences = shape_sequences;
    self.sequence_store = shape_sequence_store;
    self.hash = self.sequence_store.to_string();
  }

  fn update_from_hashes(&mut self, tiling: &Tiling) {}

  fn update_shape_point_sequence(
    &mut self,
    shape_sequences: &mut SpatialGridMap<PointSequence>,
    shape_sequence_store: &mut SequenceStore,
    shape_centroid: &Point,
    size: &usize,
    vertex_point: &Point,
    sequence_index: u8,
  ) {
    let shape_location_point: location::Point = shape_centroid.into();

    // If we haven't seen this edge point before, let's create
    // a new point sequence to store the shape sequence indexes in
    if !shape_sequences.contains(&shape_location_point) {
      shape_sequences.insert(
        shape_location_point,
        1.0,
        None,
        PointSequence::default()
          .with_center(*shape_centroid)
          .with_size(*size as u8),
      );
    }

    let mut shape_sequence = shape_sequences
      .get_value_mut(&shape_location_point)
      .expect("Shape sequence not found");

    shape_sequence.value.insert(*vertex_point, sequence_index);

    if shape_sequence.value.is_complete() {
      shape_sequence_store.insert(shape_sequence.value.sequence);
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
      point_sequences: SpatialGridMap::new("shape_sequences"),
      sequence_store: SequenceStore::default(),
    }
  }
}
