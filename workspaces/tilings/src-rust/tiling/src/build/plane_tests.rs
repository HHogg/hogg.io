use crate::notation::{Notation, OriginType};

use super::Plane;

#[test]
fn get_point_count_by_type_center_point() -> Result<(), Box<dyn std::error::Error>> {
  let notation = Notation::default().from_string("3", false, false)?;
  let mut plane = Plane::default();
  plane.build(&notation)?;
  let point_count = plane.get_point_count_by_type(&OriginType::CenterPoint);

  assert_eq!(point_count, 1);

  Ok(())
}

#[test]
fn get_point_count_by_type_mid_point() -> Result<(), Box<dyn std::error::Error>> {
  let notation = Notation::default().from_string("3", false, false)?;
  let mut plane = Plane::default();
  plane.build(&notation)?;
  let point_count = plane.get_point_count_by_type(&OriginType::MidPoint);

  assert_eq!(point_count, 3);

  Ok(())
}

#[test]
fn get_point_count_by_type_end_point() -> Result<(), Box<dyn std::error::Error>> {
  let notation = Notation::default().from_string("3", false, false)?;
  let mut plane = Plane::default();
  plane.build(&notation)?;
  let point_count = plane.get_point_count_by_type(&OriginType::EndPoint);

  assert_eq!(point_count, 3);

  Ok(())
}
