use insta::assert_debug_snapshot;

use super::*;
use crate::Shape;

#[test]
fn from_string_with_invalid_operation() {
  assert_debug_snapshot!(Transform::from_string("t".into(), &Shape::Triangle.into()));
}

#[test]
fn from_string_with_value_min() {
  assert_debug_snapshot!(Transform::from_string("r0".into(), &Shape::Triangle.into()));
}

#[test]
fn from_string_with_value_max() {
  assert_debug_snapshot!(Transform::from_string(
    "r181".into(),
    &Shape::Triangle.into()
  ));
}

#[test]
fn from_string_with_unexpected_char_after_close() {
  assert_debug_snapshot!(Transform::from_string(
    "r(h1)a".into(),
    &Shape::Triangle.into()
  ));
}

#[test]
fn from_string_with_invalid_origin_type() {
  assert_debug_snapshot!(Transform::from_string(
    "r(x1)".into(),
    &Shape::Triangle.into()
  ));
}

#[test]
fn from_string_with_invalid_origin_index() {
  assert_debug_snapshot!(Transform::from_string(
    "r(h1a)".into(),
    &Shape::Triangle.into()
  ));
}

#[test]
fn from_string_valid_continuous() {
  assert_debug_snapshot!(Transform::from_string(
    "r60".into(),
    &Shape::Triangle.into()
  ));
}

#[test]
fn from_string_valid_eccentric() {
  assert_debug_snapshot!(Transform::from_string(
    "r(h1)".into(),
    &Shape::Triangle.into()
  ));
}
