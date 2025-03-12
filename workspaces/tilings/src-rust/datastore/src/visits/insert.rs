use anyhow::Result;
use hogg_tiling_generator::notation::{Path, Shape};
use sqlx::{Pool, Postgres};

pub struct InsertRequest {
  pub session_id: String,
  pub path: Path,
  pub path_index: i32,
  pub valid_notations: Vec<String>,
  pub count_total_tilings: u32,
}

pub async fn insert(pool: &Pool<Postgres>, request: InsertRequest) -> Result<()> {
  let InsertRequest {
    count_total_tilings,
    session_id,
    path,
    path_index,
    valid_notations,
  } = request;

  let has_0 = path.has_shape(&Shape::Skip);
  let has_3 = path.has_shape(&Shape::Triangle);
  let has_4 = path.has_shape(&Shape::Square);
  let has_6 = path.has_shape(&Shape::Hexagon);
  let has_8 = path.has_shape(&Shape::Octagon);
  let has_12 = path.has_shape(&Shape::Dodecagon);

  let result = sqlx::query(
    "INSERT INTO visits (
        path,
        index,
        level,
        is_invalid,
        valid_tilings,
        count_valid_tilings,
        count_total_tilings,
        session_id,
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
          $11,
          $12,
          $13,
          $14
      ) ON CONFLICT (path) DO UPDATE SET
        index = $2,
        level = $3,
        is_invalid = $4,
        valid_tilings = $5,
        count_valid_tilings = $6,
        count_total_tilings = $7,
        session_id = $8,
        has_0 = $9,
        has_3 = $10,
        has_4 = $11,
        has_6 = $12,
        has_8 = $13,
        has_12 = $14",
  )
  .bind(path.to_string())
  .bind(path_index)
  .bind(path.get_level() as i32)
  .bind(valid_notations.is_empty())
  .bind(valid_notations.join(";"))
  .bind(valid_notations.len() as i32)
  .bind(count_total_tilings as i32)
  .bind(session_id)
  .bind(has_0)
  .bind(has_3)
  .bind(has_4)
  .bind(has_6)
  .bind(has_8)
  .bind(has_12)
  .execute(pool)
  .await;

  if let Err(error) = result {
    tracing::error!(%error, "writing visits");
  }

  Ok(())
}
