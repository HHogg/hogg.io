use actix::prelude::*;
use anyhow::Result;
use serde::{Deserialize, Serialize};
use tiling::{BuildContext, Path};

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct VisitResult {
  pub path: Path,
  pub build_context: BuildContext,
}

impl VisitResult {
  pub fn with_path(mut self, path: Path) -> Self {
    self.path = path;
    self
  }

  pub fn with_build_context(mut self, build_context: BuildContext) -> Self {
    self.build_context = build_context;
    self
  }
}

impl Message for VisitResult {
  type Result = Result<()>;
}
