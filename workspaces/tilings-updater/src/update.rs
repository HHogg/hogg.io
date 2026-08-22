use anyhow::Result;
use crossterm::{
  cursor, execute,
  terminal::{Clear, ClearType},
};
use progressing::{mapping, Baring};
use sqlx::{Pool, Postgres};
use std::io::stdout;

use hogg_tiling_datastore::{
  state::{self, State},
  tilings, visits, Direction,
};
use hogg_tiling_generator::{notation, FeatureToggle, Tiling};

pub async fn run_update(pool: &Pool<Postgres>, dry_run: bool) -> Result<()> {
  run_update_visits(pool, dry_run).await?;
  run_update_tilings(pool, dry_run).await?;
  run_update_state(pool, dry_run).await?;
  Ok(())
}

pub async fn run_update_visits(pool: &Pool<Postgres>, dry_run: bool) -> Result<()> {
  let visits = visits::get_paged(
    pool,
    &visits::get_paged::Request {
      page: 0,
      page_direction: Direction::Ascending,
      page_size: 1,
      search: "".into(),
      show_nodes: vec![],
      show_invalid_tilings: true,
      show_valid_tilings: true,
    },
  )
  .await?;

  let mut path = notation::Path::from_first();
  let mut path_index: i32 = 0;
  let mut processed_count = 0;
  let mut progress_bar = mapping::Bar::with_range(0, visits.total);

  loop {
    let result =
      visits::get_by_path(pool, visits::get_by_path::Request { path: path.clone() }).await?;

    if let Some(visit) = result {
      if !dry_run && visit.index != path_index {
        visits::insert(
          pool,
          visits::insert::Request {
            session_id: visit.session_id,
            path: path.clone(),
            path_index,
            valid_tilings: visit.valid_tilings,
            count_total_tilings: visit.count_total_tilings as u32,
          },
        )
        .await?;
      }

      processed_count += 1;
      progress_bar.set(processed_count);

      if processed_count > 1 {
        execute!(
          stdout(),
          cursor::MoveUp(3),
          Clear(ClearType::FromCursorDown)
        )?;
      }

      println!("{}", progress_bar);
      println!("{}", path);
      println!("{}", path_index);

      path = path.next_path();
      path_index += 1;
    } else {
      break;
    }
  }

  execute!(
    stdout(),
    cursor::MoveUp(2),
    Clear(ClearType::FromCursorDown)
  )?;
  println!("Completed visits update");

  Ok(())
}

pub async fn run_update_tilings(pool: &Pool<Postgres>, dry_run: bool) -> Result<()> {
  let mut processed_count = 0;
  let mut page = 0;
  let page_size: i32 = 1000;

  loop {
    let response = tilings::get_paged(
      pool,
      &tilings::get_paged::Request {
        page,
        page_direction: Direction::Ascending,
        page_size,
        search: "".into(),
        show_distinct: false,
        show_nodes: vec![],
        show_uniform: vec![],
      },
    )
    .await?;

    let mut progress_bar = mapping::Bar::with_range(0, response.total);

    for result in response.results.iter() {
      let tiling = Tiling::default()
        .with_feature_toggles([FeatureToggle::Hashing])
        .with_repetitions(3)
        .from_string(&result.notation);

      let hash = tiling.result.hash;
      let visit = visits::get_by_path(
        pool,
        visits::get_by_path::Request {
          path: tiling.notation.path.clone(),
        },
      )
      .await?
      .expect("Visit to exist");

      if !dry_run && result.path_index != visit.index && result.hash != hash {
        tilings::insert(
          pool,
          tilings::insert::Request {
            path: tiling.notation.path,
            path_index: visit.index,
            valid_results: vec![tilings::VisitResultValid {
              notation: result.notation.clone(),
              hash: hash.clone(),
              transform_index: result.transform_index,
            }],
          },
        )
        .await?;
      }

      processed_count += 1;
      progress_bar.set(processed_count);

      if processed_count > 1 {
        execute!(
          stdout(),
          cursor::MoveUp(3),
          Clear(ClearType::FromCursorDown)
        )?;
      }

      println!("{}", progress_bar);
      println!("{}", result.notation);
      println!("{}", hash)
    }

    if response.results.len() < page_size as usize {
      break;
    } else {
      page += 1;
    }
  }

  execute!(
    stdout(),
    cursor::MoveUp(2),
    Clear(ClearType::FromCursorDown)
  )?;
  println!("Completed tilings update");

  Ok(())
}

pub async fn run_update_state(pool: &Pool<Postgres>, dry_run: bool) -> Result<()> {
  let visits = visits::get_paged(
    pool,
    &visits::get_paged::Request {
      page: 0,
      page_direction: Direction::Descending,
      page_size: 1,
      search: "".into(),
      show_nodes: vec![],
      show_invalid_tilings: true,
      show_valid_tilings: true,
    },
  )
  .await?;

  let visit = visits.results.get(0).expect("a visit");
  let path = &visit.path;
  let path_index = visit.index;
  let next_path = path.next_path();
  let next_path_index = path_index + 1;

  if !dry_run {
    state::set(
      pool,
      State {
        path: next_path.clone(),
        path_index: next_path_index,
      },
    )
    .await?;
  }

  println!("State: {path} / {path_index}");
  println!("Completed state update");

  Ok(())
}
