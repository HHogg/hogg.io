use actix::prelude::*;
use anyhow::Result;
use hogg_tiling_datastore::sessions::{self, Session};

use crate::datastore::sessions::Store;

pub struct Insert(pub Session);

impl Message for Insert {
  type Result = Result<()>;
}

impl Handler<Insert> for Store {
  type Result = ResponseFuture<Result<()>>;

  fn handle(&mut self, msg: Insert, _ctx: &mut Self::Context) -> Self::Result {
    let pool = self.pool.clone();

    Box::pin(async move {
      sessions::insert(&pool, &msg.0).await?;
      Ok(())
    })
  }
}
