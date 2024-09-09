use std::fmt::Display;

use serde::{Deserialize, Serialize};
use tiling::notation::Shape;
use typeshare::typeshare;

pub fn get_results_condition(
  show_valid_tilings: bool,
  show_invalid_tilings: bool,
) -> Option<String> {
  let mut clauses = Vec::new();

  match (show_valid_tilings, show_invalid_tilings) {
    (true, false) => {
      clauses.push("is_invalid IS false");
    }
    (false, true) => {
      clauses.push("is_invalid IS true");
    }
    _ => {}
  }

  if clauses.is_empty() {
    None
  } else {
    Some(format!("({})", clauses.join(" OR ")))
  }
}

pub fn get_show_nodes_condition(show_nodes: &[Shape]) -> Option<String> {
  let mut clauses = Vec::new();

  if show_nodes.contains(&Shape::Skip) {
    clauses.push("has_0 IS true");
  }

  if show_nodes.contains(&Shape::Triangle) {
    clauses.push("has_3 IS true");
  }

  if show_nodes.contains(&Shape::Square) {
    clauses.push("has_4 IS true");
  }

  if show_nodes.contains(&Shape::Hexagon) {
    clauses.push("has_6 IS true");
  }

  if show_nodes.contains(&Shape::Octagon) {
    clauses.push("has_8 IS true");
  }

  if show_nodes.contains(&Shape::Dodecagon) {
    clauses.push("has_12 IS true");
  }

  if clauses.is_empty() {
    None
  } else {
    Some(format!("({})", clauses.join(" AND ")))
  }
}

#[derive(Copy, Clone, Debug, Deserialize, Serialize)]
#[typeshare]
pub enum Direction {
  Ascending,
  Descending,
}

impl Display for Direction {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match self {
      Self::Ascending => write!(f, "ASC"),
      Self::Descending => write!(f, "DESC"),
    }
  }
}

#[derive(Clone, Default, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct ResponseMultiple<T> {
  pub page: i32,
  pub page_size: i32,
  pub total: i32,
  pub results: Vec<T>,
}

impl<T> ResponseMultiple<T> {
  pub fn with_results(&self, results: Vec<T>) -> Self {
    Self {
      page: 0,
      page_size: 0,
      total: results.len() as i32,
      results,
    }
  }
}

#[derive(Clone, Default, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Facet {
  pub key: String,
  pub values: Vec<FacetValue>,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct FacetValue {
  pub name: String,
  pub disabled: bool,
}
