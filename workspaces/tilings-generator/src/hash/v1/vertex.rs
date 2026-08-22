use hogg_circular_sequence::{PointSequence, SequenceStore};
use hogg_geometry::Point;
use hogg_spatial_grid_map::{location, SpatialGridMap};

use crate::build::Plane;

// The vertex type is a unique point. It is determined by the
// unique edge sequence that meet at it. As more edge types are
// found, this needs updating.
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
    tiling_edge_sequence_store: &SequenceStore,
    edge_hash: &super::edge::Hash,
  ) {
    self.updated = false;

    if is_first_run {
      self.update_from_tiling(plane, tiling_edge_sequence_store);
    } else {
      self.update_from_hash(plane, edge_hash);
    }
  }

  // Here we want to determine the edge sequences that are around
  // a single vertex from the plane.
  //
  // We start from the edge midpoints and the
  // 2 length sequence (shapes on either side). With the
  // edge midpoints, we can get the line_segments that makes
  // it, which gives us access to the vertex points, and
  // then insert the sequence_index for edge_sequence into
  // that vertex point_sequences.
  fn update_from_tiling(&mut self, plane: &Plane, edge_sequence_store: &SequenceStore) {
    let mut vertex_sequences = SpatialGridMap::<PointSequence>::new("vertex_sequences");
    let mut vertex_sequence_store = SequenceStore::default();

    for point_sequence in plane
      .point_sequences
      .iter_core_mid_complete_point_sequences()
    {
      let PointSequence {
        center: line_segment_midpoint,
        sequence,
        ..
      } = point_sequence;

      let sequence_index = edge_sequence_store
        .get_index(sequence)
        .expect("edge sequence index not found")
        + 1;

      self.update_vertex_sequences(
        plane,
        &mut vertex_sequences,
        &mut vertex_sequence_store,
        line_segment_midpoint,
        sequence_index,
      );
    }

    let hash = vertex_sequence_store.to_string();

    if hash != self.hash {
      self.updated = true;
      self.hash = hash;
      self.point_sequences = vertex_sequences;
      self.sequence_store = vertex_sequence_store;
    }
  }

  fn update_from_hash(&mut self, _plane: &Plane, _edge_hash: &super::edge::Hash) {
    // let mut vertex_sequences = SpatialGridMap::<PointSequence>::new("vertex_sequences");
    // let mut vertex_sequence_store = SequenceStore::default();

    // for point_sequence in edge_hash.point_sequences.iter_values() {
    //   let PointSequence {
    //     center: line_segment_midpoint,
    //     sequence,
    //     ..
    //   } = point_sequence;

    // if edge_hash.sequence_store.get_index(sequence).is_none() {
    //   log::info!("sequence not found: {:?}", sequence);
    //   log::info!("sequence_store: {:?}", edge_hash.sequence_store);
    // }

    // let sequence_index = edge_hash
    //   .sequence_store
    //   .get_index(sequence)
    //   .expect("edge sequence index not found")
    //   + 1;

    // self.update_vertex_sequences(
    //   plane,
    //   &mut vertex_sequences,
    //   &mut vertex_sequence_store,
    //   line_segment_midpoint,
    //   sequence_index,
    // );
    // }

    // let hash = vertex_sequence_store.to_string();

    // if hash != self.hash {
    //   self.updated = true;
    //   self.hash = hash;
    //   self.point_sequences = vertex_sequences;
    //   self.sequence_store = vertex_sequence_store;
    // }
  }

  fn update_vertex_sequences(
    &mut self,
    plane: &Plane,
    vertex_sequences: &mut SpatialGridMap<PointSequence>,
    vertex_sequence_store: &mut SequenceStore,
    line_segment_midpoint: &Point,
    sequence_index: u8,
  ) {
    let line_segment = plane
      .line_segments
      .get_value(&line_segment_midpoint.into())
      .expect("line_segment not found");

    self.update_vertex_sequence(
      plane,
      vertex_sequences,
      vertex_sequence_store,
      line_segment_midpoint,
      line_segment.start,
      sequence_index,
    );

    self.update_vertex_sequence(
      plane,
      vertex_sequences,
      vertex_sequence_store,
      line_segment_midpoint,
      line_segment.end,
      sequence_index,
    );
  }

  fn update_vertex_sequence(
    &mut self,
    plane: &Plane,
    vertex_sequences: &mut SpatialGridMap<PointSequence>,
    vertex_sequence_store: &mut SequenceStore,
    line_segment_midpoint: &Point,
    vertex_point: Point,
    sequence_index: u8,
  ) {
    // Size is the number of shapes/line_segments
    // currently meeting at the vertex
    let vertex_point_sequence_size = plane
      .point_sequences
      .get_core_end_complete_point_sequence(&vertex_point)
      .map(|sequence| hogg_circular_sequence::get_length(&sequence.sequence))
      .unwrap_or_else(|| 0);

    // We only want to look at vertex points that are
    // complete
    if vertex_point_sequence_size == 0 {
      return;
    }

    let vertex_location_point: location::Point = vertex_point.into();

    // If we haven't seen this vertex point before, let's create
    // a new point sequence to store the edge sequence indexes in
    if !vertex_sequences.contains(&vertex_location_point) {
      vertex_sequences.insert(
        vertex_location_point,
        1.0,
        None,
        PointSequence::default()
          .with_center(vertex_point)
          .with_max_size(vertex_point_sequence_size as u8),
      );
    }

    let mut vertex_sequence = vertex_sequences
      .get_value_mut(&vertex_location_point)
      .expect("Vertex sequence not found");

    vertex_sequence
      .value
      .insert(*line_segment_midpoint, sequence_index);

    if vertex_sequence.value.is_complete() {
      vertex_sequence_store.insert(vertex_sequence.value.sequence);
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
      point_sequences: SpatialGridMap::new("vertex_sequences"),
      sequence_store: SequenceStore::default(),
    }
  }
}
