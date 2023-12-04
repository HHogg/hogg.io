use actix::prelude::*;
use anyhow::Result;
use tiling_datastore::insights::{self, InsightsPerMinute};
use tiling_datastore::ResponseMultiple;

use crate::datastore::insights::Store;

pub struct GetPerMinute;

impl Message for GetPerMinute {
  type Result = Result<ResponseMultiple<InsightsPerMinute>>;
}

impl Handler<GetPerMinute> for Store {
  type Result = ResponseFuture<Result<ResponseMultiple<InsightsPerMinute>>>;

  fn handle(&mut self, _: GetPerMinute, _: &mut Context<Self>) -> Self::Result {
    let pool = self.pool.clone();

    Box::pin(async move { Ok(insights::get_per_minute(&pool).await?) })
  }
}
