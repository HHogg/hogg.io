use hogg_geometry::Vector2;
use hogg_spatial_grid_map::ToroidalSpatialGridMap;

use super::{
  build_graph, find_extra_translations, validate_graph, ChamberGraph, FaceKey, LiftedPoint,
};

fn face(point_map: &mut ToroidalSpatialGridMap<()>, sides: u8, points: &[(f64, f64)]) -> FaceKey {
  let points = points
    .iter()
    .map(|(x, y)| LiftedPoint::intern(Vector2::new(*x, *y), point_map).unwrap())
    .collect::<Vec<_>>();

  FaceKey::new(sides, &points).unwrap()
}

#[test]
fn a_one_square_torus_preserves_loop_incidences() {
  let mut point_map = ToroidalSpatialGridMap::unit("test");
  let face = face(
    &mut point_map,
    4,
    &[(0.0, 0.0), (1.0, 0.0), (1.0, 1.0), (0.0, 1.0)],
  );
  let graph = build_graph(&[face]).unwrap();

  assert_eq!(graph.neighbors.len(), 8);
  assert!(graph.labels.iter().all(|label| *label == 4));
}

#[test]
fn an_enlarged_square_cell_exposes_its_primitive_translation() {
  let mut point_map = ToroidalSpatialGridMap::unit("test");
  let faces = [
    face(
      &mut point_map,
      4,
      &[(0.0, 0.0), (0.5, 0.0), (0.5, 1.0), (0.0, 1.0)],
    ),
    face(
      &mut point_map,
      4,
      &[(0.5, 0.0), (1.0, 0.0), (1.0, 1.0), (0.5, 1.0)],
    ),
  ];
  let translations = find_extra_translations(&faces, &point_map);

  assert!(translations.iter().any(|translation| {
    (translation.x - 0.5).abs() < 0.000_001 && translation.y.abs() < 0.000_001
  }));
}

#[test]
fn an_enlarged_three_face_cell_exposes_its_primitive_translation() {
  let mut point_map = ToroidalSpatialGridMap::unit("test");
  let faces = (0..3)
    .map(|index| {
      let left = index as f64 / 3.0;
      let right = (index + 1) as f64 / 3.0;

      face(
        &mut point_map,
        4,
        &[(left, 0.0), (right, 0.0), (right, 1.0), (left, 1.0)],
      )
    })
    .collect::<Vec<_>>();
  let translations = find_extra_translations(&faces, &point_map);

  assert!(translations.iter().any(|translation| {
    (translation.x - 1.0 / 3.0).abs() < 0.000_001 && translation.y.abs() < 0.000_001
  }));
}

#[test]
fn an_empty_quotient_is_rejected() {
  assert!(build_graph(&[]).is_err());
}

#[test]
fn a_non_torus_face_patch_is_rejected() {
  let mut point_map = ToroidalSpatialGridMap::unit("test");
  let face = face(
    &mut point_map,
    4,
    &[(0.0, 0.0), (0.5, 0.0), (0.5, 0.5), (0.0, 0.5)],
  );

  assert!(build_graph(&[face]).is_err());
}

#[test]
fn an_incomplete_chamber_involution_is_rejected() {
  let graph = ChamberGraph {
    labels: vec![4, 4],
    neighbors: vec![[1, 1, usize::MAX], [0, 0, usize::MAX]],
  };

  assert!(validate_graph(&graph).is_err());
}
