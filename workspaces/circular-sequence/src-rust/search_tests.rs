use pretty_assertions::assert_eq;

use super::*;

#[test]
fn get_match_returns_no_match_where_source_is_greater_than_target() {
  assert_eq!(
    get_match(
      &[3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0],
      &vec![[3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0]]
    ),
    Match::None
  );
}

#[test]
fn get_match_returns_the_first_partial_match() {
  assert_eq!(
    get_match(
      &[3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      &vec![
        [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 3, 3, 3, 4, 0, 0, 0, 0, 0, 0, 0],
        [3, 3, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0]
      ]
    ),
    Match::Partial([3, 3, 3, 3, 4, 0, 0, 0, 0, 0, 0, 0])
  );
}

#[test]
fn get_match_returns_the_first_partial_match_when_offset() {
  assert_eq!(
    get_match(
      &[3, 3, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      &vec![
        [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 3, 3, 3, 6, 0, 0, 0, 0, 0, 0, 0],
        [3, 3, 6, 6, 3, 0, 0, 0, 0, 0, 0, 0]
      ]
    ),
    Match::Partial([3, 3, 3, 3, 6, 0, 0, 0, 0, 0, 0, 0])
  );
}

#[test]
fn get_match_returns_the_first_partial_match_when_symmetrical_and_reversed() {
  assert_eq!(
    get_match(
      &[3, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      &vec![
        [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 3, 6, 6, 3, 0, 0, 0, 0, 0, 0, 0],
        [3, 4, 6, 6, 3, 0, 0, 0, 0, 0, 0, 0]
      ]
    ),
    Match::Partial([3, 3, 6, 6, 3, 0, 0, 0, 0, 0, 0, 0])
  );
}

#[test]
fn get_match_returns_the_first_partial_match_when_asymmetrical_and_reversed() {
  assert_eq!(
    get_match(
      &[3, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      &vec![
        [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 3, 3, 3, 6, 0, 0, 0, 0, 0, 0, 0],
        [3, 4, 6, 6, 3, 0, 0, 0, 0, 0, 0, 0]
      ]
    ),
    Match::Partial([3, 4, 6, 6, 3, 0, 0, 0, 0, 0, 0, 0])
  );
}

#[test]
fn get_match_returns_the_exact_match() {
  assert_eq!(
    get_match(
      &[3, 3, 3, 3, 6, 0, 0, 0, 0, 0, 0, 0],
      &vec![
        [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 3, 3, 3, 6, 0, 0, 0, 0, 0, 0, 0],
        [3, 4, 6, 6, 3, 0, 0, 0, 0, 0, 0, 0]
      ]
    ),
    Match::Exact([3, 3, 3, 3, 6, 0, 0, 0, 0, 0, 0, 0])
  );
}

#[test]
fn get_match_returns_the_exact_match_when_offset() {
  assert_eq!(
    get_match(
      &[6, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0],
      &vec![
        [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 3, 3, 3, 6, 0, 0, 0, 0, 0, 0, 0],
        [3, 4, 6, 6, 3, 0, 0, 0, 0, 0, 0, 0]
      ]
    ),
    Match::Exact([3, 3, 3, 3, 6, 0, 0, 0, 0, 0, 0, 0])
  );
}

#[test]
fn get_match_returns_the_exact_match_when_asymmetrical_and_reversed() {
  assert_eq!(
    get_match(
      &[3, 6, 6, 4, 3, 0, 0, 0, 0, 0, 0, 0],
      &vec![
        [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 3, 3, 3, 6, 0, 0, 0, 0, 0, 0, 0],
        [3, 4, 6, 6, 3, 0, 0, 0, 0, 0, 0, 0]
      ]
    ),
    Match::Exact([3, 4, 6, 6, 3, 0, 0, 0, 0, 0, 0, 0])
  );
}
