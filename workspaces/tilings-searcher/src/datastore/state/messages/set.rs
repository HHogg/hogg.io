use actix::prelude::*;
use anyhow::Result;
use hogg_tiling_datastore::state::{self, State};

use crate::datastore::state::Store;

pub struct Set(pub State);

impl Message for Set {
  type Result = Result<()>;
}

impl Handler<Set> for Store {
  type Result = ResponseFuture<Result<()>>;

  fn handle(&mut self, msg: Set, _: &mut Context<Self>) -> Self::Result {
    let pool = self.pool.clone();

    Box::pin(async move { state::set(&pool, msg.0).await })
  }
}
