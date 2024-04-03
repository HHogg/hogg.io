use insta::assert_debug_snapshot;

use super::*;
use crate::Shape;

#[test]
fn from_string_with_invalid_operation() {
  assert_debug_snapshot!(Transform::from_string("t", &Shape::Triangle.into()));
}

#[test]
fn from_string_with_value_min() {
  assert_debug_snapshot!(Transform::from_string("r0", &Shape::Triangle.into()));
}

#[test]
fn from_string_with_value_max() {
  assert_debug_snapshot!(Transform::from_string("r181", &Shape::Triangle.into()));
}

#[test]
fn from_string_with_unexpected_char_after_close() {
  assert_debug_snapshot!(Transform::from_string("r(h1)a", &Shape::Triangle.into()));
}

#[test]
fn from_string_with_invalid_origin_type() {
  assert_debug_snapshot!(Transform::from_string("r(x1)", &Shape::Triangle.into()));
}

#[test]
fn from_string_with_invalid_origin_index() {
  assert_debug_snapshot!(Transform::from_string("r(h1a)", &Shape::Triangle.into()));
}

#[test]
fn from_string_valid_continuous() {
  assert_debug_snapshot!(Transform::from_string("r60", &Shape::Triangle.into()));
}

#[test]
fn from_string_valid_eccentric() {
  assert_debug_snapshot!(Transform::from_string("r(h1)", &Shape::Triangle.into()));
}
