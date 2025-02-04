use actix::prelude::*;
use anyhow::Result;
use serde::{Deserialize, Serialize};
use hogg_tiling_datastore::sessions::{self, Session};
use hogg_tiling_datastore::ResponseMultiple;

use crate::datastore::sessions::Store;

#[derive(Deserialize, Serialize)]
pub struct GetAll;

impl Message for GetAll {
  type Result = Result<ResponseMultiple<Session>>;
}

impl Handler<GetAll> for Store {
  type Result = ResponseFuture<Result<ResponseMultiple<Session>>>;

  fn handle(&mut self, _: GetAll, _: &mut Context<Self>) -> Self::Result {
    let pool = self.pool.clone();

    Box::pin(async move { sessions::get_all(&pool).await })
  }
}
