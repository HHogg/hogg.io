use actix::prelude::*;
use anyhow::Result;
use tiling::{BuildContext, Tiling, ValidationFlag};

use super::{Visit, VisitResult};

#[derive(Debug, Default)]
pub struct Worker {}

impl Actor for Worker {
  type Context = SyncContext<Self>;
}

impl Handler<Visit> for Worker {
  type Result = Result<()>;

  fn handle(&mut self, message: Visit, _ctx: &mut Self::Context) -> Self::Result {
    let Visit { sender, path } = message;

    let mut tiling = Tiling::default()
      .with_validations(Some(ValidationFlag::all()))
      .with_build_context(Some(BuildContext::default()))
      .with_expansion_phases(3)
      .with_path(path.clone())
      .with_first_transform();

    // TODO: Create an API for this
    while let Some(_) = tiling.next() {}

    if let Some(build_context) = tiling.build_context {
      sender.try_send(
        VisitResult::default()
          .with_path(path)
          .with_build_context(build_context),
      )?;
    }

    Ok(())
  }
}
