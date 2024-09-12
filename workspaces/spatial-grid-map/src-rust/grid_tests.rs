use super::*;

#[test]
fn get_grid_size() {
  assert_eq!(SpatialGridMap::<bool>::default().get_grid_size(), 16);
}

#[test]
fn get_location_top_left() {
  let grid = SpatialGridMap::<bool>::default();
  let point = (-7.5, -7.5);
  let entry = grid.get_location(&point);

  assert_eq!(
    entry,
    Some(Location {
      key: (-8, -8),
      block_index: 0,
      bit_index: 0,
    })
  );
}

#[test]
fn get_location_top_right() {
  let grid = SpatialGridMap::<bool>::default();
  let point = (7.5, -7.5);
  let entry = grid.get_location(&point);

  assert_eq!(
    entry,
    Some(Location {
      key: (7, -8),
      block_index: 2,
      bit_index: 7,
    })
  );
}

#[test]
fn get_location_bottom_left() {
  let grid = SpatialGridMap::<bool>::default();
  let point = (-7.5, 7.5);
  let entry = grid.get_location(&point);

  assert_eq!(
    entry,
    Some(Location {
      key: (-8, 7),
      block_index: 5,
      bit_index: 24,
    })
  );
}

#[test]
fn get_location_bottom_right() {
  let grid = SpatialGridMap::<bool>::default();
  let point = (7.5, 7.5);
  let entry = grid.get_location(&point);

  assert_eq!(
    entry,
    Some(Location {
      key: (7, 7),
      block_index: 7,
      bit_index: 31,
    })
  );
}

#[test]
fn get_location_snap_x_just_under() {
  let grid = SpatialGridMap::<bool>::default();
  let point = (7.0 - TOLERANCE * 0.5, 7.0);
  let entry = grid.get_location(&point);

  assert_eq!(
    entry,
    Some(Location {
      key: (7, 7),
      block_index: 7,
      bit_index: 31,
    })
  );
}

#[test]
fn get_location_snap_y_just_under() {
  let grid = SpatialGridMap::<bool>::default();
  let point = (7.0, 7.0 - TOLERANCE * 0.5);
  let entry = grid.get_location(&point);

  assert_eq!(
    entry,
    Some(Location {
      key: (7, 7),
      block_index: 7,
      bit_index: 31,
    })
  );
}

#[test]
fn get_location_top_oob() {
  let grid = SpatialGridMap::<bool>::default();
  let point = (0.0, -8.1);
  let entry = grid.get_location(&point);

  assert_eq!(entry, None);
}

#[test]
fn get_location_right_oob() {
  let grid = SpatialGridMap::<bool>::default();
  let point = (8.0, 0.0);
  let entry = grid.get_location(&point);

  assert_eq!(entry, None);
}

#[test]
fn get_location_bottom_oob() {
  let grid = SpatialGridMap::<bool>::default();
  let point = (0.0, 8.0);
  let entry = grid.get_location(&point);

  assert_eq!(entry, None);
}

#[test]
fn get_location_left_oob() {
  let grid = SpatialGridMap::<bool>::default();
  let point = (-8.1, 0.0);
  let entry = grid.get_location(&point);

  assert_eq!(entry, None);
}

#[test]
fn insert_top_left() {
  let mut grid = SpatialGridMap::<bool>::default();
  let point = (-7.5, -7.5);

  grid.insert(point, true);

  assert!(grid.contains(&point));
  assert_eq!(grid.get_value(&point), Some(&true));
}

#[test]
fn insert_top_right() {
  let mut grid = SpatialGridMap::<bool>::default();
  let point = (7.5, -7.5);

  grid.insert(point, true);

  assert!(grid.contains(&point));
  assert_eq!(grid.get_value(&point), Some(&true));
}

#[test]
fn insert_bottom_left() {
  let mut grid = SpatialGridMap::<bool>::default();
  let point = (-7.5, 7.5);

  grid.insert(point, true);

  assert!(grid.contains(&point));
  assert_eq!(grid.get_value(&point), Some(&true));
}

#[test]
fn insert_bottom_right() {
  let mut grid = SpatialGridMap::<bool>::default();
  let point = (7.5, 7.5);
  grid.insert(point, true);

  assert!(grid.contains(&point));
  assert_eq!(grid.get_value(&point), Some(&true));
}

#[test]
fn insert_duplicate() {
  let point = (-7.5, -7.5);
  let mut grid = SpatialGridMap::<bool>::default();
  grid.insert(point, true);
  grid.insert(point, false);

  assert!(grid.contains(&point));
  assert_eq!(grid.get_value(&point), Some(&true));
}

#[test]
fn insert_duplicate_with_increased_bucket_size() {
  let point = (-7.5, -7.5);
  let mut grid = SpatialGridMap::<bool>::default();
  grid.insert(point, true);
  grid.insert(point, false);

  assert!(grid.contains(&point));
  assert_eq!(grid.get_value(&point), Some(&true));
}

#[test]
fn insert_within_same_cell_with_increased_bucket_size() {
  let point_1 = (-7.5, -7.5);
  let point_2 = (-7.5 + TOLERANCE, -7.5 + TOLERANCE);

  let mut grid = SpatialGridMap::<bool>::default();
  grid.insert(point_1, true);
  grid.insert(point_2, false);

  assert!(grid.contains(&point_1));
  assert!(grid.contains(&point_2));
  assert_eq!(grid.get_value(&point_1), Some(&true));
  assert_eq!(grid.get_value(&point_2), Some(&false));
}

#[test]
fn insert_and_rescale() {
  let mut grid = SpatialGridMap::<bool>::default();

  assert_eq!(grid.get_grid_size(), 16);
  grid.insert((-8.0, -8.0), true);
  assert_eq!(grid.get_grid_size(), 16);
  grid.insert((-9.0, -9.0), true);
  assert_eq!(grid.get_grid_size(), 32);
  assert!(grid.contains(&(-8.0, -8.0)));
  assert!(grid.contains(&(-9.0, -9.0)));
}

#[test]
fn contains_true() {
  let mut grid = SpatialGridMap::<bool>::default();
  grid.insert((-7.5, -7.5), true);

  assert!(grid.contains(&(-7.5, -7.5)));
}

#[test]
fn contains_false() {
  let grid = SpatialGridMap::<bool>::default();

  assert!(!grid.contains(&(-7.5, -7.5)));
}

#[test]
fn rescales_top_left() {
  let mut grid = SpatialGridMap::<bool>::default();
  grid.insert((-7.5, -7.5), true);

  assert_eq!(grid.get_grid_size(), 16);
  grid.increase_size();
  assert_eq!(grid.get_grid_size(), 32);

  assert_eq!(grid.get_value(&(-7.5, -7.5)), Some(&true));
}

#[test]
fn rescales_top_right() {
  let mut grid = SpatialGridMap::<bool>::default();
  grid.insert((7.5, -7.5), true);

  assert_eq!(grid.get_grid_size(), 16);
  grid.increase_size();
  assert_eq!(grid.get_grid_size(), 32);

  assert_eq!(grid.get_value(&(7.5, -7.5)), Some(&true));
}

#[test]
fn rescales_bottom_left() {
  let mut grid = SpatialGridMap::<bool>::default();
  grid.insert((-7.5, 7.5), true);

  assert_eq!(grid.get_grid_size(), 16);
  grid.increase_size();
  assert_eq!(grid.get_grid_size(), 32);

  assert_eq!(grid.get_value(&(-7.5, 7.5)), Some(&true));
}

#[test]
fn rescales_bottom_right() {
  let mut grid = SpatialGridMap::<bool>::default();
  grid.insert((7.5, 7.5), true);

  assert_eq!(grid.get_grid_size(), 16);
  grid.increase_size();
  assert_eq!(grid.get_grid_size(), 32);

  assert_eq!(grid.get_value(&(7.5, 7.5)), Some(&true));
}
