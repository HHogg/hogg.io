use std::fmt::{Display, Formatter};

use anyhow::Result;
use serde::Deserialize;
use sqlx::{FromRow, Pool, Postgres};
use tiling::Shape;
use typeshare::typeshare;

use crate::utils::{get_show_nodes_condition, FacetValue};
use crate::{Facet, ResponseMultiple};

const BASE_QUERY: &str = "
SELECT
  bool_or(has_0) as has_0,
  bool_or(has_3) as has_3,
  bool_or(has_4) as has_4,
  bool_or(has_6) as has_6,
  bool_or(has_8) as has_8,
  bool_or(has_12) as has_12,
  array_agg(DISTINCT uniform) AS uniform,
  (SELECT ARRAY(SELECT DISTINCT unnest(vertex_types) FROM tilings ORDER BY 1)) AS vertex_types,
  (SELECT ARRAY(SELECT DISTINCT unnest(shape_types) FROM tilings ORDER BY 1)) AS shape_types
FROM tilings";

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct TilingsFacetsRequest {
  pub show_nodes: Vec<Shape>,
  pub show_uniform: Vec<String>,
  pub show_vertex_types: Vec<String>,
  pub show_shape_types: Vec<String>,
}

impl Display for TilingsFacetsRequest {
  fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
    let TilingsFacetsRequest {
      show_nodes,
      show_uniform,
      show_shape_types,
      show_vertex_types,
      ..
    } = self;

    let mut conditions = vec![];

    if let Some(condition) = get_show_nodes_condition(show_nodes) {
      conditions.push(condition);
    }

    if !show_uniform.is_empty() {
      conditions.push(format!("uniform IN ({})", show_uniform.join(",")));
    }

    if !show_vertex_types.is_empty() {
      conditions.push(format!(
        "vertex_types @> ARRAY['{}']",
        show_vertex_types.join("','")
      ));
    }

    if !show_shape_types.is_empty() {
      conditions.push(format!(
        "shape_types @> ARRAY['{}']",
        show_shape_types.join("','")
      ));
    }

    if conditions.is_empty() {
      write!(f, "")
    } else {
      write!(f, "WHERE {}", conditions.join(" AND "))
    }
  }
}

#[derive(Clone, FromRow)]
pub struct FacetRow {
  pub has_0: bool,
  pub has_3: bool,
  pub has_4: bool,
  pub has_6: bool,
  pub has_8: bool,
  pub has_12: bool,
  pub uniform: Vec<i32>,
  pub vertex_types: Vec<String>,
  pub shape_types: Vec<String>,
}

pub async fn get_facets(
  pool: &Pool<Postgres>,
  request: TilingsFacetsRequest,
) -> Result<ResponseMultiple<Facet>> {
  let all_facets = sqlx::query_as::<_, FacetRow>(BASE_QUERY)
    .fetch_one(pool)
    .await?;

  let filtered_facets = sqlx::query_as::<_, FacetRow>(format!("{BASE_QUERY} {request}").as_str())
    .fetch_one(pool)
    .await?;

  Ok(ResponseMultiple::default().with_results(vec![
      Facet {
        key: "shape".to_string(),
        values: Shape::as_vec()
          .iter()
          .map(|s| {
            FacetValue {
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
            }
          })
          .collect(),
      },
      Facet {
        key: "uniform".to_string(),
        values: all_facets
          .uniform
          .iter()
          .map(|u| {
            FacetValue {
              name: u.to_string(),
              disabled: !filtered_facets.uniform.contains(u),
            }
          })
          .collect(),
      },
      Facet {
        key: "vertexTypes".to_string(),
        values: all_facets
          .vertex_types
          .iter()
          .map(|v| {
            FacetValue {
              name: v.to_string(),
              disabled: !filtered_facets.vertex_types.contains(v),
            }
          })
          .collect(),
      },
      Facet {
        key: "shapeTypes".to_string(),
        values: all_facets
          .shape_types
          .iter()
          .map(|s| {
            FacetValue {
              name: s.to_string(),
              disabled: !filtered_facets.shape_types.contains(s),
            }
          })
          .collect(),
      },
    ]))
}
