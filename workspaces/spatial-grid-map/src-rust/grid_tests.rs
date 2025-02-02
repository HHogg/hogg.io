use super::*;

#[test]
fn get_grid_size() {
  assert_eq!(SpatialGridMap::<bool>::new("test").get_grid_size(), 16);
}

#[test]
fn insert_top_left() {
  let mut grid = SpatialGridMap::<bool>::new("test");
  let point = location::Point(-7.5, -7.5);

  grid.insert(point, 1.0, None, true);

  assert!(grid.contains(&point));
  assert_eq!(grid.get_value(&point), Some(&true));
}

#[test]
fn insert_top_right() {
  let mut grid = SpatialGridMap::<bool>::new("test");
  let point = location::Point(7.5, -7.5);

  grid.insert(point, 1.0, None, true);

  assert!(grid.contains(&point));
  assert_eq!(grid.get_value(&point), Some(&true));
}

#[test]
fn insert_bottom_left() {
  let mut grid = SpatialGridMap::<bool>::new("test");
  let point = location::Point(-7.5, 7.5);

  grid.insert(point, 1.0, None, true);

  assert!(grid.contains(&point));
  assert_eq!(grid.get_value(&point), Some(&true));
}

#[test]
fn insert_bottom_right() {
  let mut grid = SpatialGridMap::<bool>::new("test");
  let point = location::Point(7.5, 7.5);
  grid.insert(point, 1.0, None, true);

  assert!(grid.contains(&point));
  assert_eq!(grid.get_value(&point), Some(&true));
}

#[test]
fn insert_duplicate() {
  let point = location::Point(-7.5, -7.5);
  let mut grid = SpatialGridMap::<bool>::new("test");
  grid.insert(point, 1.0, None, true);
  grid.insert(point, 1.0, None, false);

  assert!(grid.contains(&point));
  assert_eq!(grid.get_value(&point), Some(&true));
}

#[test]
fn insert_and_rescale() {
  let mut grid = SpatialGridMap::<bool>::new("test");
  let point_a = location::Point(-8.0, -8.0);
  let point_b = location::Point(-9.0, -9.0);

  assert_eq!(grid.get_grid_size(), 16);
  grid.insert(point_a, 1.0, None, true);
  assert_eq!(grid.get_grid_size(), 16);
  grid.insert(point_b, 1.0, None, true);
  assert_eq!(grid.get_grid_size(), 32);
  assert!(grid.contains(&point_a));
  assert!(grid.contains(&point_b));
}

#[test]
fn contains_true() {
  let mut grid = SpatialGridMap::<bool>::new("test");
  let point = location::Point(-7.5, -7.5);

  grid.insert(point, 1.0, None, true);

  assert!(grid.contains(&point));
}

#[test]
fn contains_false() {
  let grid = SpatialGridMap::<bool>::new("test");
  let point = location::Point(-7.5, -7.5);

  assert!(!grid.contains(&point));
}

#[test]
fn rescales_top_left() {
  let mut grid = SpatialGridMap::<bool>::new("test");
  let point = location::Point(-7.5, -7.5);

  grid.insert(point, 1.0, None, true);

  assert_eq!(grid.get_grid_size(), 16);
  grid.increase_size();
  assert_eq!(grid.get_grid_size(), 32);

  assert_eq!(grid.get_value(&point), Some(&true));
}

#[test]
fn rescales_top_right() {
  let mut grid = SpatialGridMap::<bool>::new("test");
  let point = location::Point(7.5, -7.5);

  grid.insert(point, 1.0, None, true);

  assert_eq!(grid.get_grid_size(), 16);
  grid.increase_size();
  assert_eq!(grid.get_grid_size(), 32);

  assert_eq!(grid.get_value(&point), Some(&true));
}

#[test]
fn rescales_bottom_left() {
  let mut grid = SpatialGridMap::<bool>::new("test");
  let point = location::Point(-7.5, 7.5);

  grid.insert(point, 1.0, None, true);

  assert_eq!(grid.get_grid_size(), 16);
  grid.increase_size();
  assert_eq!(grid.get_grid_size(), 32);

  assert_eq!(grid.get_value(&point), Some(&true));
}

#[test]
fn rescales_bottom_right() {
  let mut grid = SpatialGridMap::<bool>::new("test");
  let point = location::Point(7.5, 7.5);

  grid.insert(point, 1.0, None, true);

  assert_eq!(grid.get_grid_size(), 16);
  grid.increase_size();
  assert_eq!(grid.get_grid_size(), 32);

  assert_eq!(grid.get_value(&point), Some(&true));
}
