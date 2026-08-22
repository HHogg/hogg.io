use actix::prelude::*;
use anyhow::Result;

use crate::datastore::state;
use crate::issuer::Issuer;

pub struct StoreCurrentPath;

impl Message for StoreCurrentPath {
  type Result = Result<()>;
}

impl Handler<StoreCurrentPath> for Issuer {
  type Result = ResponseFuture<Result<()>>;

  fn handle(&mut self, _msg: StoreCurrentPath, _ctx: &mut Self::Context) -> Self::Result {
    let state_store_addr = self.state_store_addr.clone();
    let state = self.state.clone();

    Box::pin(async move {
      state_store_addr
        .send(state::messages::Set(state.lock().await.clone()))
        .await?
    })
  }
}
