use anyhow::Result;
use chrono::NaiveDateTime;
use serde::Serialize;
use sqlx::FromRow;
use typeshare::typeshare;

use crate::ResponseMultiple;

#[derive(Clone, Default, FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct InsightsPerMinute {
  #[typeshare(serialized_as = "string")]
  pub minute: NaiveDateTime,
  pub level: i32,
  pub count_sessions: i32,
  pub count_nodes: i32,
  pub count_valid_tilings: i32,
  pub count_total_tilings: i32,
}

pub async fn get_per_minute(pool: &sqlx::PgPool) -> Result<ResponseMultiple<InsightsPerMinute>> {
  let results = sqlx::query_as::<_, InsightsPerMinute>(
    "
    SELECT
      minute,
      level,
      CAST(count_sessions AS INT),
      CAST(count_nodes AS INT),
      CAST(count_valid_tilings AS INT),
      CAST(count_total_tilings AS INT)
    FROM insights_per_minute
    ORDER BY minute ASC
    ",
  )
  .fetch_all(pool)
  .await?;

  Ok(ResponseMultiple::default().with_results(results))
}
