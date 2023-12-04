use actix::prelude::*;
use anyhow::Result;

use crate::datastore::insights::Store;

pub struct RefreshPerLevel;

impl Message for RefreshPerLevel {
  type Result = Result<()>;
}

impl Handler<RefreshPerLevel> for Store {
  type Result = ResponseFuture<Result<()>>;

  fn handle(&mut self, _: RefreshPerLevel, _: &mut Context<Self>) -> Self::Result {
    let pool = self.pool.clone();

    Box::pin(async move {
      sqlx::query("REFRESH MATERIALIZED VIEW CONCURRENTLY insights_per_level")
        .execute(&pool)
        .await?;

      Ok(())
    })
  }
}
