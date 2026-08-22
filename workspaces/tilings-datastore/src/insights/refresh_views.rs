use anyhow::Result;

pub async fn refresh_per_level(pool: &sqlx::PgPool) -> Result<()> {
  sqlx::query("REFRESH MATERIALIZED VIEW CONCURRENTLY insights_per_level")
    .execute(pool)
    .await?;

  Ok(())
}

pub async fn refresh_per_minute(pool: &sqlx::PgPool) -> Result<()> {
  sqlx::query("REFRESH MATERIALIZED VIEW CONCURRENTLY insights_per_minute")
    .execute(pool)
    .await?;

  Ok(())
}

pub async fn refresh_per_session(pool: &sqlx::PgPool) -> Result<()> {
  sqlx::query("REFRESH MATERIALIZED VIEW CONCURRENTLY insights_per_session")
    .execute(pool)
    .await?;

  Ok(())
}
