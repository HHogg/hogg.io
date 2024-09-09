use actix::prelude::*;
use anyhow::Result;
use tiling::notation::Path;
use tiling_datastore::tilings::{self, InsertRequest};

use crate::datastore::tilings::Store;

pub struct Insert {
  pub path: Path,
  pub path_index: i32,
  pub results: Vec<tiling::build::Result>,
}

impl Message for Insert {
  type Result = Result<()>;
}

impl Handler<Insert> for Store {
  type Result = ResponseFuture<Result<()>>;

  fn handle(&mut self, message: Insert, _: &mut Context<Self>) -> Self::Result {
    let Insert {
      path,
      path_index,
      results,
    } = message;

    let pool = self.pool.clone();

    Box::pin(async move {
      tilings::insert(
        &pool,
        InsertRequest {
          path,
          path_index,
          results,
        },
      )
      .await
    })
  }
}
