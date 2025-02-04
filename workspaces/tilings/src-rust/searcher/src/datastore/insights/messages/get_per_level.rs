use actix::prelude::*;
use anyhow::Result;
use hogg_tiling_datastore::insights::{self, InsightsPerLevel};
use hogg_tiling_datastore::ResponseMultiple;

use crate::datastore::insights::Store;

pub struct GetPerLevel;

impl Message for GetPerLevel {
  type Result = Result<ResponseMultiple<InsightsPerLevel>>;
}

impl Handler<GetPerLevel> for Store {
  type Result = ResponseFuture<Result<ResponseMultiple<InsightsPerLevel>>>;

  fn handle(&mut self, _: GetPerLevel, _: &mut Context<Self>) -> Self::Result {
    let pool = self.pool.clone();

    Box::pin(async move { insights::get_per_level(&pool).await })
  }
}
