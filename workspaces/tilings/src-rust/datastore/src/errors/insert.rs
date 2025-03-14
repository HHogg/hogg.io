use anyhow::Result;
use futures_util::future::try_join_all;
use hogg_tiling_generator::ApplicationError;
use sqlx::{Pool, Postgres};

pub async fn insert(pool: &Pool<Postgres>, errors: Vec<ApplicationError>) -> Result<()> {
  let futures_insert_errors = errors.iter().cloned().map(|error| {
    sqlx::query(
      "INSERT INTO errors (
          tiling,
          reason
        ) VALUES (
          $1,
          $2
        )",
    )
    .bind(error.tiling)
    .bind(error.reason)
    .execute(pool)
  });

  try_join_all(futures_insert_errors).await?;

  Ok(())
}
