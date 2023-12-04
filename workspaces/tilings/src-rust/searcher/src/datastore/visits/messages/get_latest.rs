use actix::prelude::*;
use anyhow::Result;
use tiling_datastore::visits;

use crate::datastore::visits::Store;

pub struct GetLatest;

impl Message for GetLatest {
  type Result = Result<Option<String>>;
}

impl Handler<GetLatest> for Store {
  type Result = ResponseFuture<Result<Option<String>>>;

  fn handle(&mut self, _message: GetLatest, _: &mut Context<Self>) -> Self::Result {
    let pool = self.pool.clone();

    Box::pin(async move { visits::get_latest(&pool).await })
  }
}
