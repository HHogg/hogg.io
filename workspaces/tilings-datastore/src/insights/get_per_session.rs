use anyhow::Result;
use serde::Serialize;
use sqlx::FromRow;
use typeshare::typeshare;

use crate::ResponseMultiple;

#[derive(Clone, Default, FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct InsightsPerSession {
  pub session_id: String,
  pub count_nodes: i32,
  pub count_valid_tilings: i32,
  pub count_total_tilings: i32,
}

pub async fn get_per_session(pool: &sqlx::PgPool) -> Result<ResponseMultiple<InsightsPerSession>> {
  let results = sqlx::query_as::<_, InsightsPerSession>(
    "
    SELECT
      session_id,
      CAST(count_nodes AS INT),
      CAST(count_valid_tilings AS INT),
      CAST(count_total_tilings AS INT)
    FROM insights_per_session
    ",
  )
  .fetch_all(pool)
  .await?;

  Ok(ResponseMultiple::default().with_results(results))
}
