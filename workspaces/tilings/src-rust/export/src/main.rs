mod export_insights;
mod export_stats;
mod export_unique_tilings;
mod export_valid_tilings;

use std::fs::File;

use anyhow::Result;
use clap::{arg, command, Parser};
use sqlx::FromRow;
use hogg_tiling_datastore::get_pool;
use tracing_subscriber::fmt::format;

use self::export_insights::export_insights;
use self::export_stats::export_stats;
use self::export_unique_tilings::export_unique_tilings;
use self::export_valid_tilings::export_valid_tilings;

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
pub struct Args {
  /// Postgres database URL that stores the traversals and state of the search
  #[arg(short, long, default_value = "postgres://localhost:5432/tilings")]
  database_url: String,
  /// Level of logs to produce
  #[arg(short, long, default_value = "info")]
  log_level: tracing::Level,
  /// Directory for DB migrations
  #[arg(long, default_value = "./migrations")]
  migrations_dir: String,
}

#[derive(FromRow)]
pub struct TraversalRow {
  pub path: String,
  pub is_blocked: bool,
  pub valid_transforms: String,
  pub invalid_transforms: String,
  pub blocked_transforms: String,
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

  let pool = get_pool(args.database_url, args.migrations_dir, false).await?;

  // Output all the valid GomJau-Hogg notations
  export_valid_tilings(&pool, create_output_file("./results/valid_tilings.txt")?).await?;

  // Output all the valid tilings found to show on the website
  export_unique_tilings(&pool, create_output_file("./results/output.json")?).await?;

  // Output the stats of the search to display on the website
  export_stats(&pool, create_output_file("./results/search_stats.json")?).await?;

  // Out the insights to display graphs on the website
  export_insights(&pool, create_output_file("./results/insights.json")?).await?;

  Ok(())
}

fn create_output_file(output_path: &str) -> Result<File> {
  // Remove file if it exists
  if std::path::Path::new(output_path).exists() {
    std::fs::remove_file(output_path)?;
  }

  Ok(
    File::options()
      .append(true)
      .create(true)
      .open(output_path)?,
  )
}
