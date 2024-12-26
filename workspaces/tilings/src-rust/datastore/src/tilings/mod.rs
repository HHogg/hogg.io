mod get_facets;
mod get_paged;
mod insert;

use chrono::NaiveDateTime;
use serde::Serialize;
use sqlx::FromRow;

pub use self::get_facets::{get_facets, TilingsFacetsRequest};
pub use self::get_paged::{get_paged, TilingsRequest};
pub use self::insert::{insert, InsertRequest, VisitResultValid};

#[derive(FromRow, Serialize)]
pub struct Tiling {
  pub notation: String,
  pub has_0: bool,
  pub has_3: bool,
  pub has_4: bool,
  pub has_6: bool,
  pub has_8: bool,
  pub has_12: bool,
  pub uniform: i32,
  pub p_index: i32,
  pub t_index: i32,
  pub timestamp: NaiveDateTime,
}
