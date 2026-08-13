use hogg_geometry::{Affine2, LineSegment, Point, Vector2};

use super::{derive_periodicity, Lattice};

fn line(start: (f64, f64), end: (f64, f64)) -> LineSegment {
  LineSegment::default()
    .with_start(Point::at(start.0, start.1))
    .with_end(Point::at(end.0, end.1))
}

#[test]
fn parallel_reflections_prove_a_rank_two_translation_lattice() {
  let source = [
    Affine2::reflection(&line((0.0, -1.0), (0.0, 1.0))).unwrap(),
    Affine2::reflection(&line((1.0, -1.0), (1.0, 1.0))).unwrap(),
    Affine2::reflection(&line((-1.0, 0.0), (1.0, 0.0))).unwrap(),
    Affine2::reflection(&line((-1.0, 1.0), (1.0, 1.0))).unwrap(),
  ];

  let periodicity = derive_periodicity(&source).unwrap();
  let horizontal = periodicity.lattice.coordinates(Vector2::new(2.0, 0.0));
  let vertical = periodicity.lattice.coordinates(Vector2::new(0.0, 2.0));

  assert!((horizontal.x - horizontal.x.round()).abs() < 0.000_001);
  assert!((horizontal.y - horizontal.y.round()).abs() < 0.000_001);
  assert!((vertical.x - vertical.x.round()).abs() < 0.000_001);
  assert!((vertical.y - vertical.y.round()).abs() < 0.000_001);
  assert!((periodicity.lattice.area() - 4.0).abs() < 0.000_001);
}

#[test]
fn a_finite_point_group_without_translations_is_rejected() {
  let source = [Affine2::rotation(std::f64::consts::PI * 0.5, None)];

  assert!(derive_periodicity(&source).is_err());
}

#[test]
fn lattice_refinement_accepts_lattice_coordinates() {
  let lattice = Lattice::new(Vector2::new(2.0, 0.0), Vector2::new(0.0, 1.0)).unwrap();
  let refined = lattice
    .refine_coordinates(&[Vector2::new(0.5, 0.0)])
    .unwrap();

  assert!((refined.area() - 1.0).abs() < 0.000_001);
  let horizontal = refined.coordinates(Vector2::new(1.0, 0.0));
  assert!((horizontal.x - horizontal.x.round()).abs() < 0.000_001);
  assert!((horizontal.y - horizontal.y.round()).abs() < 0.000_001);
}
