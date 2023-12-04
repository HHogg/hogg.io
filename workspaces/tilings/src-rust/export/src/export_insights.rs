use std::fs::File;
use std::io::Write;

use anyhow::Result;
use serde::Serialize;
use sqlx::PgPool;
use tiling_datastore::insights::{self, InsightsPerMinute};

#[derive(Default, Serialize)]
struct Insights {
  insights_per_minute: Vec<InsightsPerMinute>,
}

pub async fn export_insights(pool: &PgPool, mut file: File) -> Result<()> {
  let insights_per_minute = insights::get_per_minute(pool).await?.results;

  file.write_all(
    serde_json::to_string_pretty(&Insights {
      insights_per_minute,
    })?
    .as_bytes(),
  )?;

  Ok(())
}
