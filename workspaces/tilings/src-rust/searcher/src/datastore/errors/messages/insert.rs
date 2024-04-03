use actix::prelude::*;
use anyhow::Result;
use tiling::ApplicationError;
use tiling_datastore::errors;

use crate::datastore::errors::Store;

pub struct Insert {
  pub errors: Vec<ApplicationError>,
}

impl Message for Insert {
  type Result = Result<()>;
}

impl Handler<Insert> for Store {
  type Result = ResponseFuture<Result<()>>;

  fn handle(&mut self, msg: Insert, _ctx: &mut Self::Context) -> Self::Result {
    let pool = self.pool.clone();

    Box::pin(async move { errors::insert(&pool, msg.errors).await })
  }
}
