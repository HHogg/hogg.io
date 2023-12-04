use actix::prelude::*;
use anyhow::Result;

use crate::datastore::insights::Store;

pub struct RefreshPerSession;

impl Message for RefreshPerSession {
  type Result = Result<()>;
}

impl Handler<RefreshPerSession> for Store {
  type Result = ResponseFuture<Result<()>>;

  fn handle(&mut self, _: RefreshPerSession, _: &mut Context<Self>) -> Self::Result {
    let pool = self.pool.clone();

    Box::pin(async move {
      sqlx::query("REFRESH MATERIALIZED VIEW CONCURRENTLY insights_per_session")
        .execute(&pool)
        .await?;

      Ok(())
    })
  }
}
