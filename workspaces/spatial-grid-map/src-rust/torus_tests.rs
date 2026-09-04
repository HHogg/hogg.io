use crate::location;
use crate::utils::coordinate_equals;

use super::{EntryId, ToroidalSpatialGridMap, Winding};

#[test]
fn points_across_the_periodic_seam_share_an_id() {
  let mut map = ToroidalSpatialGridMap::unit("test");
  let (origin, _, inserted) = map.intern(location::Point(0.0, 0.0), "origin");
  let (wrapped, winding, wrapped_inserted) = map.intern(location::Point(1.0, -1.0), "wrapped");

  assert!(inserted);
  assert!(!wrapped_inserted);
  assert_eq!(origin, wrapped);
  assert_eq!(winding, Winding { x: 1, y: -1 });
  assert_eq!(map.get(origin), Some(&"origin"));
}

#[test]
fn thirds_remain_distinct_and_translate_around_the_torus() {
  let mut map = ToroidalSpatialGridMap::unit("test");
  let ids = (0..3)
    .map(|index| map.intern(location::Point(index as f64 / 3.0, 0.0), ()).0)
    .collect::<Vec<_>>();

  assert_eq!(ids, vec![EntryId(0), EntryId(1), EntryId(2)]);

  for (index, expected) in ids.iter().copied().enumerate() {
    let translated = (index as f64 + 3.0) / 3.0;
    let (actual, _) = map
      .locate(location::Point(translated, 0.0))
      .expect("translated third must be interned");

    assert_eq!(actual, expected);
  }
}

#[test]
fn ids_are_stable_coordinate_independent_handles() {
  let mut map = ToroidalSpatialGridMap::unit("test");
  let (id, winding, _) = map.intern(location::Point(-0.25, 1.25), 42);

  assert_eq!(map.get(id), Some(&42));
  let point = map.point(id).expect("interned ID must have a point");
  assert!(coordinate_equals(point.0, 0.75));
  assert!(coordinate_equals(point.1, 0.25));
  assert_eq!(winding, Winding { x: -1, y: 1 });
  let lifted = map
    .lift(id, winding)
    .expect("interned ID and winding must lift");
  assert!(coordinate_equals(lifted.0, -0.25));
  assert!(coordinate_equals(lifted.1, 1.25));
}
