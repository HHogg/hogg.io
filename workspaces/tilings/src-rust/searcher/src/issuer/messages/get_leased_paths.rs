use actix::prelude::*;
use tiling::notation::Path;

use crate::issuer::Issuer;

pub struct GetLeasedPaths;

impl Message for GetLeasedPaths {
  type Result = Vec<Path>;
}

impl Handler<GetLeasedPaths> for Issuer {
  type Result = ResponseFuture<Vec<Path>>;

  fn handle(&mut self, _msg: GetLeasedPaths, _ctx: &mut Self::Context) -> Self::Result {
    let leases = self.leases.clone();

    Box::pin(async move { leases.lock().await.keys().cloned().collect() })
  }
}
