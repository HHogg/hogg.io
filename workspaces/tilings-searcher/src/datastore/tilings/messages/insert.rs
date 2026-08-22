use actix::prelude::*;
use anyhow::Result;
use hogg_tiling_datastore::tilings::{self, VisitResultValid};
use hogg_tiling_generator::notation::Path;

use crate::datastore::tilings::Store;

pub struct Insert {
  pub path: Path,
  pub path_index: i32,
  pub valid_results: Vec<VisitResultValid>,
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
      valid_results,
    } = message;

    let pool = self.pool.clone();

    Box::pin(async move {
      tilings::insert(
        &pool,
        tilings::insert::Request {
          path,
          path_index,
          valid_results,
        },
      )
      .await
    })
  }
}
