use anyhow::Result;
use sqlx::{Pool, Postgres};

use super::Session;
use crate::ResponseMultiple;

pub async fn get_all(pool: &Pool<Postgres>) -> Result<ResponseMultiple<Session>> {
  Ok(
    ResponseMultiple::default().with_results(
      sqlx::query_as::<_, Session>(
        "SELECT * FROM sessions WHERE worker_count > 0 ORDER BY timestamp_start ASC",
      )
      .fetch_all(pool)
      .await?,
    ),
  )
}
