use actix::prelude::*;
use anyhow::Result;
use hogg_tiling_datastore::tilings::{self, InsertRequest, VisitResultValid};
use hogg_tiling_generator::notation::Path;

use crate::datastore::tilings::Store;

pub struct Insert {
  pub path: Path,
  pub path_index: i32,
  pub count_total_tilings: u32,
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
      count_total_tilings,
      valid_results,
    } = message;

    let pool = self.pool.clone();

    Box::pin(async move {
      tilings::insert(
        &pool,
        InsertRequest {
          path,
          path_index,
          count_total_tilings,
          valid_results,
        },
      )
      .await
    })
  }
}
