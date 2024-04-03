use actix::prelude::*;
use anyhow::Result;
use tiling_datastore::visits::{get_by_path, VisitRequest};

use crate::datastore::visits::{Store, Tree};

pub struct GetByPath(pub VisitRequest);

impl Message for GetByPath {
  type Result = Result<Option<Tree>>;
}

impl Handler<GetByPath> for Store {
  type Result = ResponseFuture<Result<Option<Tree>>>;

  fn handle(&mut self, message: GetByPath, _: &mut Context<Self>) -> Self::Result {
    let pool = self.pool.clone();

    Box::pin(async move {
      Ok(
        get_by_path(pool, message.0)
          .await?
          .and_then(|visit| Tree::from_visit(visit).ok()),
      )
    })
  }
}
