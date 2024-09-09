use anyhow::Result;
use sqlx::{Pool, Postgres};
use tiling::build::Context;
use tiling::notation::{Path, Shape};

pub struct InsertRequest {
  pub session_id: String,
  pub path: Path,
  pub path_index: i32,
  pub build_context: Context,
}

pub async fn insert(pool: &Pool<Postgres>, request: InsertRequest) -> Result<()> {
  let InsertRequest {
    session_id,
    path,
    path_index,
    build_context,
  } = request;

  let has_0 = path.has_shape(&Shape::Skip);
  let has_3 = path.has_shape(&Shape::Triangle);
  let has_4 = path.has_shape(&Shape::Square);
  let has_6 = path.has_shape(&Shape::Hexagon);
  let has_8 = path.has_shape(&Shape::Octagon);
  let has_12 = path.has_shape(&Shape::Dodecagon);

  sqlx::query(
    "INSERT INTO visits (
        path,
        level,
        is_invalid,
        valid_tilings,
        count_valid_tilings,
        count_total_tilings,
        has_0,
        has_3,
        has_4,
        has_6,
        has_8,
        has_12,
        session_id,
        index
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
      ) ON CONFLICT (path) DO UPDATE SET
        level = $2,
        is_invalid = $3,
        valid_tilings = $4,
        count_valid_tilings = $5,
        count_total_tilings = $6,
        has_0 = $7,
        has_3 = $8,
        has_4 = $9,
        has_6 = $10,
        has_8 = $11,
        has_12 = $12,
        session_id = $13,
        index = $14",
  )
  .bind(path.to_string())
  .bind(path.get_level() as i32)
  .bind(build_context.results.is_empty())
  .bind(
    build_context
      .results
      .iter()
      .map(|t| t.notation.clone())
      .collect::<Vec<_>>()
      .join(";"),
  )
  .bind(build_context.results.len() as i32)
  .bind(build_context.count_total_tilings as i32)
  .bind(has_0)
  .bind(has_3)
  .bind(has_4)
  .bind(has_6)
  .bind(has_8)
  .bind(has_12)
  .bind(session_id)
  .bind(path_index)
  .execute(pool)
  .await?;

  Ok(())
}
