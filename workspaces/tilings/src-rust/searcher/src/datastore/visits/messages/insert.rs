use actix::prelude::*;
use anyhow::Result;
use hogg_tiling_datastore::visits::{self, InsertRequest};

use crate::datastore::visits::Store;
use crate::visitor;

pub struct Insert {
  pub session_id: String,
  pub path_index: i32,
  pub result: visitor::messages::VisitResult,
}

impl Message for Insert {
  type Result = Result<()>;
}

impl Handler<Insert> for Store {
  type Result = ResponseFuture<Result<()>>;

  fn handle(&mut self, msg: Insert, _: &mut Context<Self>) -> Self::Result {
    let Insert {
      session_id,
      path_index,
      result,
    } = msg;
    let pool = self.pool.clone();

    Box::pin(async move {
      visits::insert(
        &pool,
        InsertRequest {
          session_id,
          path: result.path,
          path_index,
          count_total_tilings: result.count_total_tilings,
          valid_notations: result
            .valid_results
            .iter()
            .map(|result| result.notation.clone())
            .collect(),
        },
      )
      .await
    })
  }
}
