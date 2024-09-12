use anyhow::Result;
use futures_util::future::try_join_all;
use sqlx::{Pool, Postgres};
use tiling::build;
use tiling::notation::{Path, Shape};

pub struct InsertRequest {
  pub path: Path,
  pub path_index: i32,
  pub results: Vec<build::Result>,
}

pub async fn insert(pool: &Pool<Postgres>, request: InsertRequest) -> Result<()> {
  let InsertRequest {
    path,
    path_index,
    results,
  } = request;

  let has_0 = path.has_shape(&Shape::Skip);
  let has_3 = path.has_shape(&Shape::Triangle);
  let has_4 = path.has_shape(&Shape::Square);
  let has_6 = path.has_shape(&Shape::Hexagon);
  let has_8 = path.has_shape(&Shape::Octagon);
  let has_12 = path.has_shape(&Shape::Dodecagon);

  let futures_insert_results = results.iter().cloned().map(|t| {
    sqlx::query(
      "INSERT INTO tilings (
          notation,
          has_0,
          has_3,
          has_4,
          has_6,
          has_8,
          has_12,
          path_index,
          transform_index,
          uniform,
          hash
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
          has_0 = $2,
          has_3 = $3,
          has_4 = $4,
          has_6 = $5,
          has_8 = $6,
          has_12 = $7,
          path_index = $8,
          transform_index = $9,
          uniform = $10,
          hash = $11
      ",
    )
    .bind(t.notation)
    .bind(has_0)
    .bind(has_3)
    .bind(has_4)
    .bind(has_6)
    .bind(has_8)
    .bind(has_12)
    .bind(path_index)
    .bind(t.transform_index)
    // .bind(t.uniform) // TODO: implement uniform or remove from db
    // .bind(t.hash) // TODO: implement hash or remove from db
    .execute(pool)
  });

  if let Err(error) = try_join_all(futures_insert_results).await {
    tracing::error!(%error, "writing tilings");
  }

  Ok(())
}
