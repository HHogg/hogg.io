use anyhow::Result;
use futures_util::future::try_join_all;
use hogg_tiling_generator::notation::{Path, Shape};
use serde::{Deserialize, Serialize};
use sqlx::{Pool, Postgres};

#[derive(Clone, Debug, Deserialize)]
#[serde(rename = "TilingsInsertRequest")]
#[serde(rename_all = "camelCase")]
pub struct Request {
  pub path: Path,
  pub path_index: i32,
  pub valid_results: Vec<VisitResultValid>,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
pub struct VisitResultValid {
  pub notation: String,
  pub hash: String,
  pub transform_index: i32,
  pub vertex_types: Vec<String>,
  pub edge_types: Vec<String>,
  pub shape_types: Vec<String>,
}

pub async fn insert(pool: &Pool<Postgres>, request: Request) -> Result<()> {
  let Request {
    path,
    path_index,
    valid_results,
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
          has_12,
          vertex_types,
          edge_types,
          shape_types
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
            $11,
            $12,
            $13,
            $14
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
          has_12 = $11,
          vertex_types = $12,
          edge_types = $13,
          shape_types = $14
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
    .bind(result.vertex_types)
    .bind(result.edge_types)
    .bind(result.shape_types)
    .execute(pool)
  });

  if let Err(error) = try_join_all(futures_insert_results).await {
    tracing::error!(%error, "writing tilings");
  }

  Ok(())
}
