use anyhow::Result;
use futures_util::future::try_join_all;
use sqlx::{Pool, Postgres};
use tiling::{Path, Shape, ValidTiling};

pub struct InsertRequest {
  pub path: Path,
  pub path_index: i32,
  pub tilings: Vec<ValidTiling>,
}

pub async fn insert(pool: &Pool<Postgres>, request: InsertRequest) -> Result<()> {
  let InsertRequest {
    path,
    path_index,
    tilings,
  } = request;

  let has_0 = path.has_shape(&Shape::Skip);
  let has_3 = path.has_shape(&Shape::Triangle);
  let has_4 = path.has_shape(&Shape::Square);
  let has_6 = path.has_shape(&Shape::Hexagon);
  let has_8 = path.has_shape(&Shape::Octagon);
  let has_12 = path.has_shape(&Shape::Dodecagon);

  let futures_insert_tilings = tilings.iter().cloned().map(|t| {
    let vertex_types: Vec<String> = t.vertex_types.clone().into();
    let shape_types: Vec<String> = t.shape_types.clone().into();

    sqlx::query(
      "INSERT INTO tilings (
          notation,
          has_0,
          has_3,
          has_4,
          has_6,
          has_8,
          has_12,
          uniform,
          vertex_types,
          shape_types,
          p_index,
          t_index,
          d_key
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
            $13
        ) ON CONFLICT (notation) DO UPDATE SET
          has_0 = $2,
          has_3 = $3,
          has_4 = $4,
          has_6 = $5,
          has_8 = $6,
          has_12 = $7,
          uniform = $8,
          vertex_types = $9,
          shape_types = $10,
          p_index = $11,
          t_index = $12,
          d_key = $13
      ",
    )
    .bind(t.notation)
    .bind(has_0)
    .bind(has_3)
    .bind(has_4)
    .bind(has_6)
    .bind(has_8)
    .bind(has_12)
    .bind(t.uniform)
    .bind(vertex_types)
    .bind(shape_types)
    .bind(path_index)
    .bind(t.t_index)
    .bind(t.d_key)
    .execute(pool)
  });

  if let Err(error) = try_join_all(futures_insert_tilings).await {
    tracing::error!(%error, "writing tilings");
  }

  Ok(())
}
