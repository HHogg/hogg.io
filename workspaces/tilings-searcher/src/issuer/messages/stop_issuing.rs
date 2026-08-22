use actix::prelude::*;

use crate::issuer::Issuer;

pub struct StopIssuing;

impl Message for StopIssuing {
  type Result = ();
}

impl Handler<StopIssuing> for Issuer {
  type Result = ResponseFuture<()>;

  fn handle(&mut self, _: StopIssuing, _ctx: &mut Self::Context) -> Self::Result {
    let stop_issuing = self.stop_issuing.clone();

    Box::pin(async move {
      *stop_issuing.lock().await = true;
    })
  }
}
