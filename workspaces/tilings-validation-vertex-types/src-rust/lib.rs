use std::sync::OnceLock;

use hogg_circular_sequence::{to_string_one, Match, PointSequence, SequenceStore};
use hogg_spatial_grid_map::MutBucketEntry;

fn known_sequences() -> &'static SequenceStore {
  static KNOWN_SEQUENCES: OnceLock<SequenceStore> = OnceLock::new();

  KNOWN_SEQUENCES.get_or_init(|| {
    SequenceStore::from(vec![
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
    ])
  })
}

pub fn validate_vertex_type(
  mut point_sequence: MutBucketEntry<'_, PointSequence>,
) -> Result<(), String> {
  if point_sequence.value.is_complete() {
    return Ok(());
  }

  match known_sequences().get_match(&point_sequence.value.sequence) {
    Match::Exact(_) => {
      let size = point_sequence.value.size() as u8;
      point_sequence.value.update_max_size(size);
    }
    Match::Partial(_) => {}
    Match::None => return Err(to_string_one(point_sequence.value.sequence)),
  }

  Ok(())
}
