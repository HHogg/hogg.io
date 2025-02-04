use std::fmt::Display;

use anyhow::Result;
use serde::Deserialize;
use sqlx::{Pool, Postgres};
use hogg_tiling::notation::Shape;
use typeshare::typeshare;

use super::Visit;
use crate::utils::{get_results_condition, get_show_nodes_condition, Direction, ResponseMultiple};

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct VisitsRequest {
  pub page: i32,
  pub page_direction: Direction,
  pub page_size: i32,
  pub search: String,
  pub show_nodes: Vec<Shape>,
  pub show_invalid_tilings: bool,
  pub show_valid_tilings: bool,
}

impl Display for VisitsRequest {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    let VisitsRequest {
      search,
      show_nodes,
      show_invalid_tilings,
      show_valid_tilings,
      ..
    } = self;

    let mut conditions = vec![];

    if !search.is_empty() {
      conditions.push(format!("path LIKE '{}%'", search));
    }

    if let Some(condition) = get_results_condition(*show_valid_tilings, *show_invalid_tilings) {
      conditions.push(condition);
    }

    if let Some(condition) = get_show_nodes_condition(show_nodes) {
      conditions.push(condition);
    }

    if conditions.is_empty() {
      write!(f, "")
    } else {
      write!(f, "WHERE {}", conditions.join(" AND "))
    }
  }
}

async fn get_total(pool: &Pool<Postgres>, request: &VisitsRequest) -> Result<i64> {
  Ok(
    sqlx::query_scalar(format!("SELECT COUNT(*) FROM visits {request}").as_str())
      .fetch_one(pool)
      .await?,
  )
}

async fn get_rows(pool: &Pool<Postgres>, request: &VisitsRequest) -> Result<Vec<Visit>> {
  let VisitsRequest {
    page,
    page_size,
    page_direction,
    ..
  } = request;

  Ok(
    sqlx::query_as::<_, Visit>(
      format!(
        "
      SELECT
        path,
        is_invalid,
        valid_tilings,
        count_total_tilings,
        session_id,
        index
      FROM visits
      {request}
      ORDER BY index {page_direction}
      LIMIT $1
      OFFSET $2"
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
  request: &VisitsRequest,
) -> Result<ResponseMultiple<Visit>> {
  let total = get_total(pool, request).await?;
  let rows = get_rows(pool, request).await?;

  Ok(ResponseMultiple {
    page: request.page,
    page_size: request.page_size,
    total: total as i32,
    results: rows,
  })
}
