use actix::prelude::*;
use anyhow::Result;

use crate::issuer::Issuer;

#[derive(Debug)]
pub struct FlushLeases;

impl Message for FlushLeases {
  type Result = Result<()>;
}

impl Handler<FlushLeases> for Issuer {
  type Result = ResponseFuture<Result<()>>;

  fn handle(&mut self, _: FlushLeases, _ctx: &mut Self::Context) -> Self::Result {
    let leases = self.leases.clone();
    let buffer_tx = self.buffer_tx.clone();

    Box::pin(async move {
      leases.lock().await.iter().try_for_each(|(path, ..)| {
        buffer_tx.try_send(path.clone()).map_err(|error| {
          tracing::error!(%error, path = %path, "failed_to_send_flush_lease_into_buffer");
          error
        })
      })?;

      Ok(())
    })
  }
}
