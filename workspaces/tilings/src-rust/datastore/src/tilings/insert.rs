use anyhow::Result;
use futures_util::future::try_join_all;
use serde::{Deserialize, Serialize};
use sqlx::{Pool, Postgres};
use tiling::notation::{Path, Shape};

pub struct InsertRequest {
  pub path: Path,
  pub path_index: i32,
  pub count_total_tilings: u32,
  pub valid_results: Vec<VisitResultValid>,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
pub struct VisitResultValid {
  pub notation: String,
  pub hash: String,
  pub transform_index: i32,
}

pub async fn insert(pool: &Pool<Postgres>, request: InsertRequest) -> Result<()> {
  let InsertRequest {
    path,
    path_index,
    valid_results,
    ..
  } = request;

  let has_0 = path.has_shape(&Shape::Skip);
  let has_3 = path.has_shape(&Shape::Triangle);
  let has_4 = path.has_shape(&Shape::Square);
  let has_6 = path.has_shape(&Shape::Hexagon);
  let has_8 = path.has_shape(&Shape::Octagon);
  let has_12 = path.has_shape(&Shape::Dodecagon);

  let futures_insert_results = valid_results.iter().cloned().map(|result| {
    sqlx::query(
      "INSERT INTO tilings (
          notation,
          hash,
          path,
          path_index,
          transform_index,
          has_0,
          has_3,
          has_4,
          has_6,
          has_8,
          has_12
        ) VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11
        ) ON CONFLICT (notation) DO UPDATE SET
          hash = $2,
          path = $3,
          path_index = $4,
          transform_index = $5,
          has_0 = $6,
          has_3 = $7,
          has_4 = $8,
          has_6 = $9,
          has_8 = $10,
          has_12 = $11
      ",
    )
    .bind(result.notation)
    .bind(result.hash)
    .bind(path.to_string())
    .bind(path_index)
    .bind(result.transform_index)
    .bind(has_0)
    .bind(has_3)
    .bind(has_4)
    .bind(has_6)
    .bind(has_8)
    .bind(has_12)
    .execute(pool)
  });

  if let Err(error) = try_join_all(futures_insert_results).await {
    tracing::error!(%error, "writing tilings");
  }

  Ok(())
}
