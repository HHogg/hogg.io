use serde::Serialize;
use typeshare::typeshare;

use super::Plane;
use crate::notation::Notation;
use crate::{ApplicationError, TilingError};

#[derive(Clone, Debug, Default, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Context {
  pub application_errors: Vec<ApplicationError>,
  pub count_total_tilings: u16,
  pub results: Vec<super::Result>,
}

impl Context {
  pub(crate) fn add_result(
    &mut self,
    notation: &Notation,
    plane: &Plane,
    result: &Result<(), TilingError>,
  ) {
    self.count_total_tilings += 1;

    match result {
      Err(TilingError::Application { reason }) => {
        self.application_errors.push(ApplicationError {
          tiling: notation.to_string(),
          reason: reason.clone(),
        });
      }
      Ok(()) => {
        self.results.push(
          super::Result::default()
            .with_notation(notation.to_string())
            .with_hash(plane.classifier.get_unique_key())
            .with_transform_index(notation.transforms.index),
        );
      }
      _ => {}
    }
  }
}
