use actix::prelude::*;
use anyhow::Result;
// use tiling::{validation, Tiling};

use super::Visit;

#[derive(Debug, Default)]
pub struct Worker {}

impl Actor for Worker {
  type Context = SyncContext<Self>;
}

impl Handler<Visit> for Worker {
  type Result = Result<()>;

  fn handle(&mut self, _message: Visit, _ctx: &mut Self::Context) -> Self::Result {
    // let Visit { path, .. } = message;

    // let mut tiling = Tiling::default()
    //   .with_validations(Some(validation::Flag::all()))
    //   .with_expansion_phases(3)
    //   .with_path(path.clone())
    //   .with_first_transform();

    // TODO: Create an API for this
    // TODO: Removed context for memory issue reasons.
    // stream results back to the sender
    // while tiling.find_next_tiling(None).is_some() {}

    // sender.try_send(
    //   VisitResult::default()
    //     .with_path(path)
    //     .with_build_context(tiling.build_context),
    // )?;

    Ok(())
  }
}
