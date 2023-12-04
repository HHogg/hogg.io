use chrono::{NaiveDateTime, Utc};
use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use crate::pattern::Patterns;
use crate::{ApplicationError, Tiling};

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[typeshare]
pub struct BuildContext {
  pub application_errors: Vec<ApplicationError>,
  pub count_total_tilings: u16,
  pub valid_tilings: Vec<ValidTiling>,
}

impl BuildContext {
  pub(crate) fn incr(&mut self) {
    self.count_total_tilings += 1;
  }

  pub(crate) fn add_application_error(&mut self, tiling: String, reason: String) {
    self
      .application_errors
      .push(ApplicationError { tiling, reason });
  }

  pub(crate) fn add_valid_tiling(&mut self, valid_tiling: ValidTiling) {
    self.valid_tilings.push(valid_tiling);
  }
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct ValidTiling {
  pub notation: String,
  pub d_key: String,
  pub t_index: i32,
  pub uniform: i32,
  #[typeshare(serialized_as = "Vec<String>")]
  pub vertex_types: Patterns,
  #[typeshare(serialized_as = "Vec<String>")]
  pub shape_types: Patterns,
  #[typeshare(serialized_as = "string")]
  pub timestamp: NaiveDateTime,
}

impl ValidTiling {
  pub fn from_tiling(tiling: &Tiling) -> Self {
    let vertex_types = tiling.polygons.vertex_type_store.vertex_types.clone();
    let shape_types = tiling.polygons.shape_type_store.shape_types.clone();
    let d_key = format!("{}-{}", vertex_types, shape_types);

    ValidTiling {
      notation: tiling.to_string(),
      d_key,
      t_index: tiling.transforms.index,
      uniform: 0,
      vertex_types,
      shape_types,
      timestamp: Utc::now().naive_utc(),
    }
  }
}
