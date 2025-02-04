use actix::prelude::*;
use anyhow::Result;
use hogg_tiling_datastore::insights::{self, InsightsPerSession};
use hogg_tiling_datastore::ResponseMultiple;

use crate::datastore::insights::Store;

pub struct GetPerSession;

impl Message for GetPerSession {
  type Result = Result<ResponseMultiple<InsightsPerSession>>;
}

impl Handler<GetPerSession> for Store {
  type Result = ResponseFuture<Result<ResponseMultiple<InsightsPerSession>>>;

  fn handle(&mut self, _: GetPerSession, _: &mut Context<Self>) -> Self::Result {
    let pool = self.pool.clone();

    Box::pin(async move { insights::get_per_session(&pool).await })
  }
}
