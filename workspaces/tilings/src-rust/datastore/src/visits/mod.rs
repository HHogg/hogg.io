use serde::Serialize;
use sqlx::postgres::PgRow;
use sqlx::{FromRow, Row};
use tiling::Path;

mod get_by_path;
mod get_facets;
mod get_latest;
mod get_paged;
mod insert;

pub use get_by_path::{get_by_path, VisitRequest};
pub use get_facets::{get_facets, VisitsFacetsRequest};
pub use get_latest::get_latest;
pub use get_paged::{get_paged, VisitsRequest};
pub use insert::{insert, InsertRequest};

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
