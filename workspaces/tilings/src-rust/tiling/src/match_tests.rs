use super::*;

#[test]
fn returns_no_match_where_source_is_greater_than_target() {
  assert_eq!(
    Match::from(
      &[9, 9, 9, 9, 9, 9, 0, 0, 0, 0, 0, 0],
      &[
        [1, 9, 3, 9, 0, 0, 0, 0, 0, 0, 0, 0],
        [9, 9, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ]
      .into()
    ),
    Match::None
  );
}

#[test]
fn returns_a_match() {
  assert_eq!(
    Match::from(
      &[3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      &[
        [3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0],
        [3, 4, 3, 12, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 4, 6, 4, 0, 0, 0, 0, 0, 0, 0, 0]
      ]
      .into()
    ),
    Match::Partial([3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0])
  );

  assert_eq!(
    Match::from(
      &[3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      &[
        [3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0],
        [3, 4, 3, 12, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 4, 6, 4, 0, 0, 0, 0, 0, 0, 0, 0]
      ]
      .into()
    ),
    Match::Partial([3, 4, 3, 12, 0, 0, 0, 0, 0, 0, 0, 0])
  );

  assert_eq!(
    Match::from(
      &[3, 4, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      &[
        [3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0],
        [3, 4, 3, 12, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 4, 6, 4, 0, 0, 0, 0, 0, 0, 0, 0]
      ]
      .into()
    ),
    Match::Partial([3, 4, 6, 4, 0, 0, 0, 0, 0, 0, 0, 0])
  );

  assert_eq!(
    Match::from(
      &[3, 4, 6, 4, 0, 0, 0, 0, 0, 0, 0, 0],
      &[
        [3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0],
        [3, 4, 3, 12, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 4, 6, 4, 0, 0, 0, 0, 0, 0, 0, 0]
      ]
      .into()
    ),
    Match::Exact([3, 4, 6, 4, 0, 0, 0, 0, 0, 0, 0, 0])
  );
}
