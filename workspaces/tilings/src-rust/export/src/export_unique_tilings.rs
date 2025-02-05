use std::fs::File;
use std::io::Write;
use std::vec;

use anyhow::Result;
use hogg_tiling_datastore::tilings::TilingsRequest;
use hogg_tiling_datastore::{tilings, Direction};
use sqlx::{Pool, Postgres};

pub async fn export_unique_tilings(pool: &Pool<Postgres>, mut file: File) -> Result<()> {
  let mut page = 0;
  let mut first_result = true;
  let page_size: i32 = 1000;

  file.write_all("[\n".as_bytes())?;

  loop {
    let response = tilings::get_paged(
      pool,
      &TilingsRequest {
        page,
        page_direction: Direction::Ascending,
        page_size,
        search: "".into(),
        show_distinct: true,
        show_nodes: vec![],
        show_uniform: vec![],
      },
    )
    .await?;

    for tiling in response.results.iter() {
      let serialized = serde_json::to_string(&tiling)?;

      if first_result {
        first_result = false;
      } else {
        file.write_all(",\n".as_bytes())?;
      }

      file.write_all(format!("  {serialized}").as_bytes())?;
    }

    if response.results.len() < page_size as usize {
      break;
    } else {
      page += 1;
    }
  }

  file.write_all("\n]".as_bytes())?;

  Ok(())
}
