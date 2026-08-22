use anyhow::Result;
use sqlx::{Pool, Postgres};

use super::Session;

pub async fn insert(pool: &Pool<Postgres>, session: &Session) -> Result<()> {
  sqlx::query(
    "INSERT INTO sessions (
          id,
          worker_count,
          sys_info
        ) VALUES (
          $1,
          $2,
          $3
        )",
  )
  .bind(session.id.clone())
  .bind(session.worker_count)
  .bind(session.sys_info.clone())
  .execute(pool)
  .await?;

  Ok(())
}
