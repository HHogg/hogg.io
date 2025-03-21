use actix::prelude::*;
use anyhow::Result;
use hogg_tiling_datastore::errors::{self, Error};
use hogg_tiling_datastore::ResponseMultiple;
use serde::{Deserialize, Serialize};

use crate::datastore::errors::Store;

#[derive(Deserialize, Serialize)]
pub struct GetAll;

impl Message for GetAll {
  type Result = Result<ResponseMultiple<Error>>;
}

impl Handler<GetAll> for Store {
  type Result = ResponseFuture<Result<ResponseMultiple<Error>>>;

  fn handle(&mut self, _: GetAll, _: &mut Context<Self>) -> Self::Result {
    let pool = self.pool.clone();

    Box::pin(async move { errors::get_all(&pool).await })
  }
}
