use actix::prelude::*;
use anyhow::Result;
use tiling_datastore::sessions;

use crate::datastore::sessions::Store;

pub struct Close {
  pub id: String,
}

impl Message for Close {
  type Result = Result<()>;
}

impl Handler<Close> for Store {
  type Result = ResponseFuture<Result<()>>;

  fn handle(&mut self, msg: Close, _ctx: &mut Self::Context) -> Self::Result {
    let pool = self.pool.clone();

    Box::pin(async move { sessions::close(pool, msg.id).await })
  }
}
