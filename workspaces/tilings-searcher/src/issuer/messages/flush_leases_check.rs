use actix::prelude::*;

use crate::issuer::Issuer;

pub struct FlushLeasesCheck;

impl Message for FlushLeasesCheck {
  type Result = bool;
}

impl Handler<FlushLeasesCheck> for Issuer {
  type Result = ResponseFuture<bool>;

  fn handle(&mut self, _msg: FlushLeasesCheck, _ctx: &mut Self::Context) -> Self::Result {
    let leases = self.leases.clone();

    Box::pin(async move { leases.lock().await.is_empty() })
  }
}
