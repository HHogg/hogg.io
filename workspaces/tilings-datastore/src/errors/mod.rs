mod get_all;
mod insert;

use chrono::NaiveDateTime;
use serde::Serialize;
use sqlx::FromRow;
use typeshare::typeshare;

pub use self::get_all::get_all;
pub use self::insert::insert;

#[derive(Clone, Default, FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Error {
  pub tiling: String,
  pub reason: String,
  #[typeshare(serialized_as = "string")]
  pub timestamp: NaiveDateTime,
}
