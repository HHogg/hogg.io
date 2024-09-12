use super::*;

#[test]
fn with_radius_1() {
  let visitor = Visitor::new((0, 0), 1);
  let visited: Vec<_> = visitor.collect();

  assert_eq!(
    visited,
    vec![
      (0, 0),
      (-1, -1),
      (0, -1),
      (1, -1),
      (1, 0),
      (1, 1),
      (0, 1),
      (-1, 1),
      (-1, 0)
    ]
  );
}

#[test]
fn with_radius_2() {
  let visitor = Visitor::new((0, 0), 2);
  let visited: Vec<_> = visitor.collect();

  assert_eq!(
    visited,
    vec![
      (0, 0),
      // r = 1
      (-1, -1),
      (0, -1),
      (1, -1),
      (1, 0),
      (1, 1),
      (0, 1),
      (-1, 1),
      (-1, 0),
      // r = 2
      (-2, -2),
      (-1, -2),
      (0, -2),
      (1, -2),
      (2, -2),
      (2, -1),
      (2, 0),
      (2, 1),
      (2, 2),
      (1, 2),
      (0, 2),
      (-1, 2),
      (-2, 2),
      (-2, 1),
      (-2, 0),
      (-2, -1)
    ]
  );
}

#[test]
fn with_offset_center() {
  let visitor = Visitor::new((10, 10), 1);
  let visited: Vec<_> = visitor.collect();

  assert_eq!(
    visited,
    vec![
      (10, 10),
      (9, 9),
      (10, 9),
      (11, 9),
      (11, 10),
      (11, 11),
      (10, 11),
      (9, 11),
      (9, 10)
    ]
  );
}
