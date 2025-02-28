use actix::prelude::*;
use anyhow::Result;
use hogg_tiling::notation::Path;
use hogg_tiling::ApplicationError;
use hogg_tiling_datastore::tilings;
use serde::Serialize;

#[derive(Clone, Debug, Default, Serialize)]
pub struct VisitResult {
  pub path: Path,
  pub application_errors: Vec<ApplicationError>,
  pub count_total_tilings: u32,
  pub valid_results: Vec<tilings::VisitResultValid>,
}

impl VisitResult {
  pub fn with_path(mut self, path: Path) -> Self {
    self.path = path;
    self
  }

  pub fn increment_total_tilings(&mut self) {
    self.count_total_tilings += 1;
  }

  pub fn add_application_error(&mut self, error: ApplicationError) {
    self.application_errors.push(error);
  }

  pub fn add_valid_tiling(&mut self, result: &hogg_tiling::build::Result) {
    self.valid_results.push(tilings::VisitResultValid {
      notation: result.notation.to_string(),
      hash: result.get_hash(),
      transform_index: result.transform_index,
    });
  }
}

impl Message for VisitResult {
  type Result = Result<()>;
}
