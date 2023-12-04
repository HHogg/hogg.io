use actix::prelude::*;
use anyhow::Result;
use serde::{Deserialize, Serialize};
use tiling::Path;
use typeshare::typeshare;

use crate::search::Client;
use crate::visitor;

#[derive(Debug, Deserialize, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Visit {
  #[typeshare(serialized_as = "string")]
  pub path: Path,
}

impl Message for Visit {
  type Result = Result<()>;
}

impl Handler<Visit> for Client {
  type Result = Result<()>;

  fn handle(&mut self, msg: Visit, ctx: &mut Self::Context) -> Self::Result {
    self.visitor.try_send(visitor::messages::Visit {
      sender: ctx.address().recipient(),
      path: msg.path.clone(),
    })?;

    Ok(())
  }
}
