use std::fmt::Display;

use anyhow::Result;
use hogg_tiling_generator::notation::Shape;
use serde::Deserialize;
use sqlx::{Pool, Postgres};
use typeshare::typeshare;

use super::Tiling;
use crate::utils::{get_show_nodes_condition, Direction};
use crate::ResponseMultiple;

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct TilingsRequest {
  pub page: i32,
  pub page_direction: Direction,
  pub page_size: i32,
  pub search: String,
  pub show_distinct: bool,
  pub show_nodes: Vec<Shape>,
  pub show_uniform: Vec<String>,
}

impl Display for TilingsRequest {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    let TilingsRequest {
      search,
      show_nodes,
      show_uniform,
      ..
    } = self;

    let mut conditions = vec![];

    if !search.is_empty() {
      conditions.push(format!("notation LIKE '{}%'", search));
    }

    if let Some(condition) = get_show_nodes_condition(show_nodes) {
      conditions.push(condition);
    }

    if !show_uniform.is_empty() {
      conditions.push(format!("uniform IN ({})", show_uniform.join(",")));
    }

    if conditions.is_empty() {
      write!(f, "")
    } else {
      write!(f, "WHERE {}", conditions.join(" AND "))
    }
  }
}

async fn get_total(pool: &Pool<Postgres>, request: &TilingsRequest) -> Result<i64> {
  let count = if request.show_distinct {
    "COUNT(DISTINCT hash)"
  } else {
    "COUNT(*)"
  };

  Ok(
    sqlx::query_scalar(format!("SELECT {count} FROM tilings {request}").as_str())
      .fetch_one(pool)
      .await?,
  )
}

async fn get_rows(pool: &Pool<Postgres>, request: &TilingsRequest) -> Result<Vec<Tiling>> {
  let TilingsRequest {
    page,
    page_direction,
    page_size,
    show_distinct,
    ..
  } = request;

  let distinct = if *show_distinct {
    "DISTINCT ON(hash)"
  } else {
    ""
  };

  let order_by = if *show_distinct {
    "ORDER BY hash, path_index ASC, transform_index ASC"
  } else {
    "ORDER BY path_index ASC, transform_index ASC"
  };

  Ok(
    sqlx::query_as::<_, Tiling>(
      format!(
        "
        SELECT * FROM (
          SELECT {distinct} * FROM tilings {request} {order_by}
        ) AS results ORDER BY path_index {page_direction}, transform_index {page_direction} LIMIT $1 OFFSET $2
      "
      )
      .as_str(),
    )
    .bind(page_size)
    .bind(page * page_size)
    .fetch_all(pool)
    .await?,
  )
}

pub async fn get_paged(
  pool: &Pool<Postgres>,
  request: &TilingsRequest,
) -> Result<ResponseMultiple<Tiling>> {
  let total = get_total(pool, request).await?;
  let results = get_rows(pool, request).await?;

  Ok(ResponseMultiple {
    page: request.page,
    page_size: request.page_size,
    total: total as i32,
    results,
  })
}
