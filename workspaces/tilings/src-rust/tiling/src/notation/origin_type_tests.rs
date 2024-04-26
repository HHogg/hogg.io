use std::str::FromStr;

use insta::assert_debug_snapshot;

use super::*;

#[test]
fn parses_valid() -> Result<(), TilingError> {
  assert_eq!(OriginType::from_str("c")?, OriginType::CenterPoint);
  assert_eq!(OriginType::from_str("h")?, OriginType::MidPoint);
  assert_eq!(OriginType::from_str("v")?, OriginType::EndPoint);

  Ok(())
}

#[test]
fn parses_invalid() {
  assert_debug_snapshot!(OriginType::from_str("x"));
}

#[test]
fn next() {
  assert_eq!(OriginType::CenterPoint.next(), Some(OriginType::MidPoint));
  assert_eq!(OriginType::MidPoint.next(), Some(OriginType::EndPoint));
  assert_eq!(OriginType::EndPoint.next(), None);
}
