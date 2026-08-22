mod update;

use anyhow::Result;
use clap::Parser;
use hogg_tiling_datastore::get_pool;
use tracing_subscriber::fmt::format;

use self::update::run_update;

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
pub struct Args {
  /// Postgres database URL that stores the traversals and state of the search
  #[arg(long, default_value = "postgres://localhost:5432/tilings")]
  database_url: String,
  /// Prevents any updates and just logs what would change
  #[arg(long)]
  dry_run: bool,
  /// Level of logs to produce
  #[arg(long, default_value = "info")]
  log_level: tracing::Level,
}

#[tokio::main]
async fn main() -> Result<()> {
  let args = Args::parse();

  tracing_subscriber::fmt()
    .event_format(
      format()
        .with_ansi(false)
        .with_file(false)
        .with_level(true)
        .with_line_number(false)
        .with_source_location(false)
        .with_target(false)
        .with_thread_ids(false)
        .with_thread_names(false),
    )
    .with_max_level(args.log_level)
    .init();

  let pool = get_pool(args.database_url, false).await?;

  if args.dry_run {
    tracing::info!("Running in dry run mode");
  }

  run_update(&pool, args.dry_run).await?;

  Ok(())
}
