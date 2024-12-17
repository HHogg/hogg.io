use crate::notation::{Direction, Notation, OriginType};

use super::{OriginIndex, Plane};

#[test]
fn first_center_point_from_start() -> Result<(), Box<dyn std::error::Error>> {
  let notation = Notation::default().from_string("3", false, false)?;
  let plane = Plane::default().build(&notation)?;
  let first = OriginIndex::first(
    &Some(&plane),
    &OriginType::CenterPoint,
    &Direction::FromStart,
  );

  assert_eq!(first, OriginIndex { value: 0 });

  Ok(())
}

#[test]
fn first_center_point_from_end() -> Result<(), Box<dyn std::error::Error>> {
  let notation = Notation::default().from_string("3", false, false)?;
  let plane = Plane::default().build(&notation)?;
  let first = OriginIndex::first(&Some(&plane), &OriginType::CenterPoint, &Direction::FromEnd);

  assert_eq!(first, OriginIndex { value: 0 });

  Ok(())
}

#[test]
fn first_mid_point_from_start() -> Result<(), Box<dyn std::error::Error>> {
  let notation = Notation::default().from_string("3", false, false)?;
  let plane = Plane::default().build(&notation)?;
  let first = OriginIndex::first(&Some(&plane), &OriginType::MidPoint, &Direction::FromStart);

  assert_eq!(first, OriginIndex { value: 0 });

  Ok(())
}

#[test]
fn first_mid_point_from_end() -> Result<(), Box<dyn std::error::Error>> {
  let notation = Notation::default().from_string("3", false, false)?;
  let plane = Plane::default().build(&notation)?;
  let first = OriginIndex::first(&Some(&plane), &OriginType::MidPoint, &Direction::FromEnd);

  assert_eq!(first, OriginIndex { value: 2 });

  Ok(())
}

#[test]
fn first_end_point_from_start() -> Result<(), Box<dyn std::error::Error>> {
  let notation = Notation::default().from_string("3", false, false)?;
  let plane = Plane::default().build(&notation)?;
  let first = OriginIndex::first(&Some(&plane), &OriginType::EndPoint, &Direction::FromStart);

  assert_eq!(first, OriginIndex { value: 0 });

  Ok(())
}

#[test]
fn first_end_point_from_end() -> Result<(), Box<dyn std::error::Error>> {
  let notation = Notation::default().from_string("3", false, false)?;
  let plane = Plane::default().build(&notation)?;
  let first = OriginIndex::first(&Some(&plane), &OriginType::EndPoint, &Direction::FromEnd);

  assert_eq!(first, OriginIndex { value: 2 });

  Ok(())
}
