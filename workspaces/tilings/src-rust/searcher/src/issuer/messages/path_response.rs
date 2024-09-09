pub use actix::prelude::*;
use anyhow::Result;
use tiling::notation::Path;

#[derive(Debug)]
pub struct PathResponse {
  pub(crate) path: Path,
}

impl Message for PathResponse {
  type Result = Result<()>;
}
