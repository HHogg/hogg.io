use actix::prelude::*;
use anyhow::Result;
use hogg_tiling_datastore::state::{self, State};

use crate::datastore::state::Store;

pub struct Get;

impl Message for Get {
  type Result = Result<State>;
}

impl Handler<Get> for Store {
  type Result = ResponseFuture<Result<State>>;

  fn handle(&mut self, _: Get, _: &mut Context<Self>) -> Self::Result {
    let pool = self.pool.clone();

    Box::pin(async move { state::get(&pool).await })
  }
}
