use anyhow::Result;
use sqlx::PgPool;

use super::State;

pub async fn set(pool: &PgPool, state: State) -> Result<()> {
  sqlx::query(
    "INSERT INTO state (key, value) VALUES ('current_path', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
  )
  .bind(state.path.to_string())
  .execute(pool)
  .await?;

  sqlx::query(
    "INSERT INTO state (key, value) VALUES ('current_path_index', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
  )
  .bind(state.path_index)
  .execute(pool)
  .await?;

  Ok(())
}
