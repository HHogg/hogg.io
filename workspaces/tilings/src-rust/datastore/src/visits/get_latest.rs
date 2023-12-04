use anyhow::Result;
use sqlx::{Pool, Postgres};

pub async fn get_latest(pool: &Pool<Postgres>) -> Result<Option<String>> {
  let path = sqlx::query_scalar::<_, String>("SELECT path FROM visits ORDER BY index DESC LIMIT 1")
    .fetch_optional(pool)
    .await?;

  Ok(path)
}
