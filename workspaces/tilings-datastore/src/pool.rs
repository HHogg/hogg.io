use core::panic;
use std::path::Path;
use std::str::FromStr;

use anyhow::Result;
use sqlx::migrate::Migrator;
use sqlx::postgres::PgConnectOptions;
use sqlx::{ConnectOptions, PgPool};

const MIGRATIONS_DIR: &str = "workspaces/tilings-datastore/migrations";

pub async fn get_pool(url: String, do_reset: bool) -> Result<PgPool> {
  let options = PgConnectOptions::from_str(url.as_str())
    .expect("Failed to parse PgConnectOptions string")
    .disable_statement_logging()
    .clone();

  let pool = PgPool::connect_with(options).await?;
  tracing::trace!(url, "postgres_connected");

  if do_reset {
    reset(pool.clone()).await?;
  }

  let metadata = cargo_metadata::MetadataCommand::new().no_deps().exec()?;
  let migrations_path = Path::new(&metadata.workspace_root).join(MIGRATIONS_DIR);

  if migrations_path.exists() {
    let migrator = Migrator::new(migrations_path).await?;
    migrator.run(&pool).await?;
  } else {
    panic!("migrations_dir does not exist - {:?}", migrations_path);
  }

  Ok(pool)
}

async fn reset(pg_pool: PgPool) -> Result<()> {
  let reset_query = "
    DROP MATERIALIZED VIEW IF EXISTS insights_per_level;
    DROP MATERIALIZED VIEW IF EXISTS insights_per_minute;
    DROP MATERIALIZED VIEW IF EXISTS insights_per_session;

    DROP TABLE IF EXISTS _sqlx_migrations;
    DROP TABLE IF EXISTS state;
    DROP TABLE IF EXISTS tilings;
    DROP TABLE IF EXISTS sessions;
    DROP TABLE IF EXISTS errors;
    DROP TABLE IF EXISTS visits;

    DROP TYPE IF EXISTS sys_info;
  ";

  for line in reset_query.split('\n') {
    if !line.is_empty() {
      sqlx::query(line).execute(&pg_pool).await?;
    }
  }

  Ok(())
}
