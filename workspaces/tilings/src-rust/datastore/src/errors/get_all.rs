use anyhow::Result;
use sqlx::{Pool, Postgres};

use super::Error;
use crate::ResponseMultiple;

pub async fn get_all(pool: &Pool<Postgres>) -> Result<ResponseMultiple<Error>> {
  let results = sqlx::query_as::<_, Error>(
    "
    SELECT
      tiling,
      reason,
      timestamp
    FROM errors
    ORDER BY timestamp ASC
    ",
  )
  .fetch_all(pool)
  .await?;

  Ok(ResponseMultiple::default().with_results(results))
}
