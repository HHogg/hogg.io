use anyhow::Result;
use serde::Serialize;
use sqlx::FromRow;
use typeshare::typeshare;

use crate::ResponseMultiple;

#[derive(Clone, Default, FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct InsightsPerLevel {
  pub level: i32,
  pub duration: i32,
  pub count_nodes: i32,
  pub count_valid_tilings: i32,
  pub count_total_tilings: i32,
  pub count_valid_has_0: i32,
  pub count_valid_has_3: i32,
  pub count_valid_has_4: i32,
  pub count_valid_has_6: i32,
  pub count_valid_has_8: i32,
  pub count_valid_has_12: i32,
}

pub async fn get_per_level(pool: &sqlx::PgPool) -> Result<ResponseMultiple<InsightsPerLevel>> {
  let results = sqlx::query_as::<_, InsightsPerLevel>(
    "
    SELECT
      level,
      duration,
      CAST(count_nodes AS INT),
      CAST(count_valid_tilings AS INT),
      CAST(count_total_tilings AS INT),
      CAST(count_valid_has_0 AS INT),
      CAST(count_valid_has_3 AS INT),
      CAST(count_valid_has_4 AS INT),
      CAST(count_valid_has_6 AS INT),
      CAST(count_valid_has_8 AS INT),
      CAST(count_valid_has_12 AS INT)
    FROM insights_per_level
    ORDER BY level ASC
    ",
  )
  .fetch_all(pool)
  .await?;

  Ok(ResponseMultiple::default().with_results(results))
}
