use actix::prelude::*;
use anyhow::Result;

use crate::datastore::sessions;
use crate::search::Client;

pub struct Close;

impl Message for Close {
  type Result = Result<()>;
}

impl Handler<Close> for Client {
  type Result = ResponseFuture<Result<()>>;

  fn handle(&mut self, _msg: Close, _ctx: &mut Self::Context) -> Self::Result {
    let id = self.id.clone();
    let sessions_store_addr = self.sessions_store_addr.clone();

    Box::pin(async move {
      sessions_store_addr
        .send(sessions::messages::Close { id })
        .await??;

      Ok(())
    })
  }
}
