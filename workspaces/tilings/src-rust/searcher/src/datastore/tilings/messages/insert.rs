use actix::prelude::*;
use anyhow::Result;
use tiling::{Path, ValidTiling};
use tiling_datastore::tilings::{self, InsertRequest};

use crate::datastore::tilings::Store;

pub struct Insert {
  pub path: Path,
  pub path_index: i32,
  pub tilings: Vec<ValidTiling>,
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
      tilings,
    } = message;

    let pool = self.pool.clone();

    Box::pin(async move {
      tilings::insert(
        &pool,
        InsertRequest {
          path,
          path_index,
          tilings,
        },
      )
      .await
    })
  }
}
