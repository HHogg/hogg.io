pub mod messages;
mod tree;

use actix::prelude::*;
use serde::Serialize;
use sqlx::postgres::PgRow;
use sqlx::{FromRow, PgPool, Row};
use tiling::Path;

pub use self::tree::Tree;

#[derive(Debug)]
pub struct Store {
  pub pool: PgPool,
}

impl Store {
  pub fn new(pool: PgPool) -> Self {
    Self { pool }
  }
}

impl Actor for Store {
  type Context = Context<Self>;
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Visit {
  pub path: Path,
  pub is_invalid: bool,
  pub valid_tilings: Vec<String>,
  pub count_total_tilings: i32,
  pub session_id: String,
  pub index: i32,
}

impl<'r> FromRow<'r, PgRow> for Visit {
  fn from_row(row: &'r PgRow) -> Result<Self, sqlx::Error> {
    let path = Path::default()
      .from_string(row.try_get("path")?)
      .map_err(|e| {
        sqlx::Error::ColumnDecode {
          index: "path".into(),
          source: e.into(),
        }
      })?;

    let valid_tilings = row
      .try_get::<String, &str>("valid_tilings")?
      .split(";")
      .filter_map(|s| {
        if s.is_empty() {
          None
        } else {
          Some(s.to_string())
        }
      })
      .collect();

    let is_invalid = row.try_get("is_invalid")?;
    let count_total_tilings = row.try_get("count_total_tilings")?;
    let session_id = row.try_get("session_id")?;
    let index = row.try_get("index")?;

    Ok(Visit {
      path,
      is_invalid,
      valid_tilings,
      count_total_tilings,
      session_id,
      index,
    })
  }
}
