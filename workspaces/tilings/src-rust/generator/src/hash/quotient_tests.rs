use super::{
  build_graph, find_extra_translations, validate_graph, ChamberGraph, FaceKey, QPoint,
  COORDINATE_SCALE,
};

fn point(x: f64, y: f64) -> QPoint {
  QPoint {
    x: (x * COORDINATE_SCALE as f64).round() as i64,
    y: (y * COORDINATE_SCALE as f64).round() as i64,
  }
}

#[test]
fn a_one_square_torus_preserves_loop_incidences() {
  let face = FaceKey::new(
    4,
    &[
      point(0.0, 0.0),
      point(1.0, 0.0),
      point(1.0, 1.0),
      point(0.0, 1.0),
    ],
  )
  .unwrap();
  let graph = build_graph(&[face]).unwrap();

  assert_eq!(graph.neighbors.len(), 8);
  assert!(graph.labels.iter().all(|label| *label == 4));
}

#[test]
fn an_enlarged_square_cell_exposes_its_primitive_translation() {
  let faces = [
    FaceKey::new(
      4,
      &[
        point(0.0, 0.0),
        point(0.5, 0.0),
        point(0.5, 1.0),
        point(0.0, 1.0),
      ],
    )
    .unwrap(),
    FaceKey::new(
      4,
      &[
        point(0.5, 0.0),
        point(1.0, 0.0),
        point(1.0, 1.0),
        point(0.5, 1.0),
      ],
    )
    .unwrap(),
  ];
  let translations = find_extra_translations(&faces);

  assert!(translations.iter().any(|translation| {
    (translation.x - 0.5).abs() < 0.000_001 && translation.y.abs() < 0.000_001
  }));
}

#[test]
fn an_empty_quotient_is_rejected() {
  assert!(build_graph(&[]).is_err());
}

#[test]
fn a_non_torus_face_patch_is_rejected() {
  let face = FaceKey::new(
    4,
    &[
      point(0.0, 0.0),
      point(0.5, 0.0),
      point(0.5, 0.5),
      point(0.0, 0.5),
    ],
  )
  .unwrap();

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
