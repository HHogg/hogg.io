use actix::prelude::*;
use anyhow::Result;

use crate::datastore::insights::Store;

pub struct RefreshPerMinute;

impl Message for RefreshPerMinute {
  type Result = Result<()>;
}

impl Handler<RefreshPerMinute> for Store {
  type Result = ResponseFuture<Result<()>>;

  fn handle(&mut self, _: RefreshPerMinute, _: &mut Context<Self>) -> Self::Result {
    let pool = self.pool.clone();

    Box::pin(async move {
      sqlx::query("REFRESH MATERIALIZED VIEW CONCURRENTLY insights_per_minute")
        .execute(&pool)
        .await?;

      Ok(())
    })
  }
}
