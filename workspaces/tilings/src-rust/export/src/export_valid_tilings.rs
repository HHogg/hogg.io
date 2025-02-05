use std::fs::File;
use std::io::Write;
use std::vec;

use anyhow::Result;
use hogg_tiling_datastore::visits::VisitsRequest;
use hogg_tiling_datastore::{visits, Direction};
use sqlx::{Pool, Postgres};

pub async fn export_valid_tilings(pool: &Pool<Postgres>, mut file: File) -> Result<()> {
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
        show_invalid_tilings: false,
        show_valid_tilings: true,
      },
    )
    .await?;

    for visit in response.results.iter() {
      for tiling in visit.valid_tilings.iter() {
        file.write_all(format!("{tiling}\n").as_bytes())?;
      }
    }

    if response.results.len() < page_size as usize {
      break;
    } else {
      page += 1;
    }
  }

  Ok(())
}
