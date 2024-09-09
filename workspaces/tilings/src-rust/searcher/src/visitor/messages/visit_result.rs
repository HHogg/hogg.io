use actix::prelude::*;
use anyhow::Result;
use serde::Serialize;
use tiling::build;
use tiling::notation::Path;

#[derive(Clone, Debug, Default, Serialize)]
pub struct VisitResult {
  pub path: Path,
  pub build_context: build::Context,
}

impl VisitResult {
  pub fn with_path(mut self, path: Path) -> Self {
    self.path = path;
    self
  }

  pub fn with_build_context(mut self, build_context: build::Context) -> Self {
    self.build_context = build_context;
    self
  }
}

impl Message for VisitResult {
  type Result = Result<()>;
}
