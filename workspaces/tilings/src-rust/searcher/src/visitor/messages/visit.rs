use actix::prelude::*;
use anyhow::Result;
use tiling::notation::Path;

use super::VisitResult;
use crate::visitor::Visitor;

pub struct Visit {
  pub sender: Recipient<VisitResult>,
  pub path: Path,
}

impl Message for Visit {
  type Result = Result<()>;
}

impl Handler<Visit> for Visitor {
  type Result = Result<()>;

  fn handle(&mut self, msg: Visit, _ctx: &mut Self::Context) -> Self::Result {
    self.workers.try_send(msg)?;
    Ok(())
  }
}
