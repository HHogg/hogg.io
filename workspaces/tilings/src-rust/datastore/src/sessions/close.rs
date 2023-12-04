use anyhow::Result;
use sqlx::pool;

pub async fn close(pool: pool::Pool<sqlx::Postgres>, id: String) -> Result<()> {
  sqlx::query("UPDATE sessions SET timestamp_stop=CURRENT_TIMESTAMP WHERE id=$1")
    .bind(id.to_string())
    .execute(&pool)
    .await?;

  Ok(())
}
