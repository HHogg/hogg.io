use super::*;

#[test]
fn intersects_bbox() {
  let bbox = BBox::default()
    .with_min(Point::at(0.1, 0.1))
    .with_max(Point::at(1.0, 1.0));

  let intersections = vec![
    BBox::default()
      .with_min(Point::at(0.0, 0.0))
      .with_max(Point::at(0.9, 0.9)),
    BBox::default()
      .with_min(Point::at(0.0, 0.0))
      .with_max(Point::at(1.1, 1.1)),
    BBox::default()
      .with_min(Point::at(0.2, 0.2))
      .with_max(Point::at(0.9, 0.9)),
    BBox::default()
      .with_min(Point::at(0.2, 0.2))
      .with_max(Point::at(1.1, 1.1)),
  ];

  for intersection in intersections {
    assert!(bbox.intersects_bbox(&intersection));
  }

  let non_intersections = vec![BBox::default()
    .with_min(Point::at(1.1, 1.1))
    .with_max(Point::at(1.2, 1.2))];

  for non_intersection in non_intersections {
    assert!(!bbox.intersects_bbox(&non_intersection));
  }
}
