use std::str::FromStr;

use anyhow::Result;
use sqlx::PgPool;
use hogg_tiling::notation::Path;

use super::State;

pub async fn get(pool: &PgPool) -> Result<State> {
  let current_path: Option<Path> =
    sqlx::query_scalar::<_, String>("SELECT value FROM state WHERE key='path';")
      .fetch_optional(pool)
      .await?
      .and_then(|current_path| Path::from_str(current_path.as_str()).ok());

  let current_path_index =
    sqlx::query_scalar::<_, String>("SELECT value FROM state WHERE key='path_index';")
      .fetch_optional(pool)
      .await?;

  match (current_path, current_path_index) {
    (Some(path), Some(path_index)) => Ok(State {
      path,
      path_index: path_index.parse()?,
    }),
    _ => Ok(State {
      path: Path::default(),
      path_index: 0,
    }),
  }
}
