use std::fs::File;
use std::io::Write;
use std::vec;

use anyhow::Result;
use serde::Serialize;
use sqlx::{Pool, Postgres};
use tiling_datastore::visits::VisitsRequest;
use tiling_datastore::{sessions, visits, Direction};

#[derive(Default, Serialize)]
struct Stats {
  total_paths_visited: i32,
  total_tilings_rendered: i32,
  total_valid_tilings_found: i32,
  total_seconds_searching: i64,
}

pub async fn export_stats(pool: &Pool<Postgres>, mut file: File) -> Result<()> {
  let mut stats = Stats::default();

  let mut page = 0;
  let page_size: i32 = 1000;

  loop {
    let response = visits::get_paged(
      pool,
      &VisitsRequest {
        page,
        page_direction: Direction::Ascending,
        page_size,
        search: "".into(),
        show_nodes: vec![],
        show_invalid_tilings: true,
        show_valid_tilings: true,
      },
    )
    .await?;

    stats.total_paths_visited = response.total;

    for visit in response.results.iter() {
      stats.total_tilings_rendered += visit.count_total_tilings;
      stats.total_valid_tilings_found += visit.valid_tilings.len() as i32;
    }

    if response.results.len() < page_size as usize {
      break;
    } else {
      page += 1;
    }
  }

  let session_response = sessions::get_all(pool).await?;

  for session in session_response.results.iter() {
    let started = session.timestamp_start;
    let stopped = session
      .timestamp_stop
      .unwrap_or_else(|| chrono::Utc::now().naive_utc());
    let seconds = stopped.signed_duration_since(started).num_seconds();

    stats.total_seconds_searching += seconds;
  }

  file.write_all(serde_json::to_string_pretty(&stats)?.as_bytes())?;

  Ok(())
}
