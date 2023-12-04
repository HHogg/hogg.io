#![feature(iterator_try_collect, result_option_inspect)]

mod datastore;
mod issuer;
mod logging;
mod search;
mod visitor;

use actix::prelude::*;
use anyhow::Result;
use clap::{arg, command, Parser};
use issuer::Issuer;
use tiling_datastore::get_pool;
use tokio::signal;

use crate::datastore::{errors, insights, sessions, state, tilings, visits};

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
pub struct Args {
  /// Postgres database URL that stores the traversals and state of the search
  #[arg(long, default_value = "postgres://localhost:5432/tilings")]
  database_url: String,
  /// Drop outstanding paths on shutdown
  #[arg(long)]
  drop_outstanding: bool,
  /// Level of logs to produce
  #[arg(long, default_value = "info")]
  log_level: tracing::Level,
  /// Write logs to file
  #[arg(long)]
  log_to_file: bool,
  /// Directory for DB migrations
  #[arg(long, default_value = "./migrations")]
  migrations_dir: String,
  /// Whether to refresh the insights views in the database
  #[arg(long)]
  refresh_insights: bool,
  /// Whether to reset the database on startup
  #[arg(long)]
  reset: bool,
  /// Visitor worker count that will be spawned to process concurrent searches
  #[arg(long, default_value = "8")]
  workers: usize,
}

#[actix::main]
async fn main() -> Result<()> {
  let args = Args::parse();
  let _guard = logging::setup(args.log_level, args.log_to_file);

  // DB actors
  let pg_pool = get_pool(args.database_url, args.migrations_dir, args.reset).await?;
  let state_store_addr = state::Store::new(pg_pool.clone()).start();
  let visits_store_addr = visits::Store::new(pg_pool.clone()).start();
  let tilings_store_addr = tilings::Store::new(pg_pool.clone()).start();
  let _insights_store_addr = insights::Store::new(pg_pool.clone(), args.refresh_insights).start();
  let sessions_store_addr = sessions::Store::new(pg_pool.clone()).start();
  let errors_store_addr = errors::Store::new(pg_pool.clone()).start();

  // Issuer actor
  let issuer_addr = Issuer::with_addresses(
    errors_store_addr.clone(),
    state_store_addr,
    tilings_store_addr.clone(),
    visits_store_addr.clone(),
  )
  .await?
  .start();

  // Search client actor
  let search_client_addr = search::Client::new(
    issuer_addr.clone(),
    sessions_store_addr.clone(),
    args.workers,
  )
  .start();

  // Wait for ctrl c signal to shutdown
  match signal::ctrl_c().await {
    Ok(()) => {
      tracing::info!("Received SIGINT, shutting down");
    }
    Err(err) => {
      tracing::error!(error = %err, "Failed to listen for SIGINT");
    }
  }

  // Gracefully shutdown the issuer by processing all the outstanding
  // messages and saving the state to the database
  shutdown(issuer_addr, search_client_addr, args.drop_outstanding).await?;

  Ok(())
}

///
async fn shutdown(
  issuer_addr: Addr<Issuer>,
  search_client_addr: Addr<search::Client>,
  drop_outstanding: bool,
) -> Result<()> {
  // Prevent the issuer from issuing any more paths
  issuer_addr.try_send(issuer::messages::StopIssuing)?;

  // Send all the outstanding leases to the search client to visit
  issuer_addr.try_send(issuer::messages::FlushLeases)?;

  // Keep checking the Issuer until all the leases have been released.
  // Timing out after 60 seconds
  if !drop_outstanding {
    let remaining_paths = issuer_addr.send(issuer::messages::GetLeasedPaths).await?;

    for path in remaining_paths {
      tracing::info!(path = %path, "flushing_lease");
    }

    while !issuer_addr.send(issuer::messages::FlushLeasesCheck).await? {
      let remaining_paths = issuer_addr.send(issuer::messages::GetLeasedPaths).await?;
      tracing::info!(count = remaining_paths.len(), "flushing_leases_remaining");
      tokio::time::sleep(tokio::time::Duration::from_millis(10_000)).await;
    }
  }

  // If we're here, then everything has been processed and we can
  // close the local search client session
  search_client_addr.send(search::messages::Close).await??;

  // Write the current path back to the database
  if !drop_outstanding {
    issuer_addr
      .send(issuer::messages::StoreCurrentPath)
      .await??;
  }

  Ok(())
}
