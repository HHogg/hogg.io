use super::*;

#[test]
fn get_grid_size() {
  assert_eq!(SpatialGridMap::<bool>::default().get_grid_size(), 16);
}

#[test]
fn insert_top_left() {
  let mut grid = SpatialGridMap::<bool>::default();
  let point = (-7.5, -7.5);

  grid.insert(point, 1.0, true);

  assert!(grid.contains(&point));
  assert_eq!(grid.get_value(&point), Some(&true));
}

#[test]
fn insert_top_right() {
  let mut grid = SpatialGridMap::<bool>::default();
  let point = (7.5, -7.5);

  grid.insert(point, 1.0, true);

  assert!(grid.contains(&point));
  assert_eq!(grid.get_value(&point), Some(&true));
}

#[test]
fn insert_bottom_left() {
  let mut grid = SpatialGridMap::<bool>::default();
  let point = (-7.5, 7.5);

  grid.insert(point, 1.0, true);

  assert!(grid.contains(&point));
  assert_eq!(grid.get_value(&point), Some(&true));
}

#[test]
fn insert_bottom_right() {
  let mut grid = SpatialGridMap::<bool>::default();
  let point = (7.5, 7.5);
  grid.insert(point, 1.0, true);

  assert!(grid.contains(&point));
  assert_eq!(grid.get_value(&point), Some(&true));
}

#[test]
fn insert_duplicate() {
  let point = (-7.5, -7.5);
  let mut grid = SpatialGridMap::<bool>::default();
  grid.insert(point, 1.0, true);
  grid.insert(point, 1.0, false);

  assert!(grid.contains(&point));
  assert_eq!(grid.get_value(&point), Some(&true));
}

#[test]
fn insert_and_rescale() {
  let mut grid = SpatialGridMap::<bool>::default();

  assert_eq!(grid.get_grid_size(), 16);
  grid.insert((-8.0, -8.0), 1.0, true);
  assert_eq!(grid.get_grid_size(), 16);
  grid.insert((-9.0, -9.0), 1.0, true);
  assert_eq!(grid.get_grid_size(), 32);
  assert!(grid.contains(&(-8.0, -8.0)));
  assert!(grid.contains(&(-9.0, -9.0)));
}

#[test]
fn contains_true() {
  let mut grid = SpatialGridMap::<bool>::default();
  grid.insert((-7.5, -7.5), 1.0, true);

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
  grid.insert((-7.5, -7.5), 1.0, true);

  assert_eq!(grid.get_grid_size(), 16);
  grid.increase_size();
  assert_eq!(grid.get_grid_size(), 32);

  assert_eq!(grid.get_value(&(-7.5, -7.5)), Some(&true));
}

#[test]
fn rescales_top_right() {
  let mut grid = SpatialGridMap::<bool>::default();
  grid.insert((7.5, -7.5), 1.0, true);

  assert_eq!(grid.get_grid_size(), 16);
  grid.increase_size();
  assert_eq!(grid.get_grid_size(), 32);

  assert_eq!(grid.get_value(&(7.5, -7.5)), Some(&true));
}

#[test]
fn rescales_bottom_left() {
  let mut grid = SpatialGridMap::<bool>::default();
  grid.insert((-7.5, 7.5), 1.0, true);

  assert_eq!(grid.get_grid_size(), 16);
  grid.increase_size();
  assert_eq!(grid.get_grid_size(), 32);

  assert_eq!(grid.get_value(&(-7.5, 7.5)), Some(&true));
}

#[test]
fn rescales_bottom_right() {
  let mut grid = SpatialGridMap::<bool>::default();
  grid.insert((7.5, 7.5), 1.0, true);

  assert_eq!(grid.get_grid_size(), 16);
  grid.increase_size();
  assert_eq!(grid.get_grid_size(), 32);

  assert_eq!(grid.get_value(&(7.5, 7.5)), Some(&true));
}
