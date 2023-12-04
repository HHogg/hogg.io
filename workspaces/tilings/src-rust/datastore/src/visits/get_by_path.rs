use anyhow::Result;
use serde::Deserialize;
use sqlx::{Pool, Postgres};
use tiling::Path;
use typeshare::typeshare;

use super::Visit;

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct VisitRequest {
  #[typeshare(serialized_as = "string")]
  pub path: Path,
}

pub async fn get_by_path(pool: Pool<Postgres>, request: VisitRequest) -> Result<Option<Visit>> {
  Ok(
    sqlx::query_as::<_, Visit>(
      "SELECT
        path,
        is_invalid,
        valid_tilings,
        count_total_tilings,
        session_id,
        index
    FROM visits
    WHERE path = $1",
    )
    .bind(request.path.to_string())
    .fetch_optional(&pool)
    .await?,
  )
}
