use std::fmt::{Display, Formatter};

use anyhow::Result;
use hogg_tiling_generator::notation::Shape;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, Pool, Postgres};
use typeshare::typeshare;

use crate::utils::{get_show_nodes_condition, Facet, FacetValue, ResponseMultiple};

const FACETS_BASE_QUERY: &str = "
SELECT
  bool_or(has_0) as has_0,
  bool_or(has_3) as has_3,
  bool_or(has_4) as has_4,
  bool_or(has_6) as has_6,
  bool_or(has_8) as has_8,
  bool_or(has_12) as has_12
FROM visits";

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct VisitsFacetsRequest {
  pub show_nodes: Vec<Shape>,
  pub show_invalid_tilings: bool,
  pub show_valid_tilings: bool,
}

impl Display for VisitsFacetsRequest {
  fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
    let VisitsFacetsRequest {
      show_nodes,
      show_invalid_tilings,
      show_valid_tilings,
    } = self;

    let mut conditions = vec![];

    if let Some(condition) = get_show_nodes_condition(show_nodes) {
      conditions.push(condition);
    }

    match (show_invalid_tilings, show_valid_tilings) {
      (true, true) => {}
      (true, false) => conditions.push("is_invalid = true".to_string()),
      (false, true) => conditions.push("is_invalid = false".to_string()),
      (false, false) => {}
    }

    if conditions.is_empty() {
      write!(f, "")
    } else {
      write!(f, "WHERE {}", conditions.join(" AND "))
    }
  }
}

#[derive(Clone, FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct VisitsFacet {
  pub key: String,
  pub values: Vec<String>,
}

#[derive(Clone, FromRow)]
pub struct FacetRow {
  pub has_0: bool,
  pub has_3: bool,
  pub has_4: bool,
  pub has_6: bool,
  pub has_8: bool,
  pub has_12: bool,
}

pub async fn get_facets(
  pool: Pool<Postgres>,
  request: VisitsFacetsRequest,
) -> Result<ResponseMultiple<Facet>> {
  let filtered_facets =
    sqlx::query_as::<_, FacetRow>(format!("{FACETS_BASE_QUERY} {request}").as_str())
      .fetch_one(&pool)
      .await?;

  Ok(ResponseMultiple {
    page: 0,
    page_size: 0,
    total: 1,
    results: vec![Facet {
      key: "shape".to_string(),
      values: Shape::as_vec()
        .iter()
        .map(|s| FacetValue {
          name: s.get_name(),
          disabled: match s.get_name().as_str() {
            "Skip" => !filtered_facets.has_0,
            "Triangle" => !filtered_facets.has_3,
            "Square" => !filtered_facets.has_4,
            "Hexagon" => !filtered_facets.has_6,
            "Octagon" => !filtered_facets.has_8,
            "Dodecagon" => !filtered_facets.has_12,
            _ => false,
          },
        })
        .collect(),
    }],
  })
}
