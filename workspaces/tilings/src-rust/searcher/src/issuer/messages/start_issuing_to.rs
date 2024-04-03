use actix::prelude::*;
use anyhow::Result;

use super::PathResponse;
use crate::issuer::{self, Issuer};

pub struct StartIssuingTo {
  pub recipient: Recipient<PathResponse>,
  pub count: usize,
}

impl Message for StartIssuingTo {
  type Result = Result<usize>;
}

impl Handler<StartIssuingTo> for Issuer {
  type Result = ResponseActFuture<Self, Result<usize>>;

  fn handle(&mut self, msg: StartIssuingTo, _ctx: &mut Self::Context) -> Self::Result {
    let buffer_size = self.buffer_size.clone();
    let buffer_rx = self.buffer_rx.clone();

    Box::pin(
      async move {
        let mut buffer_size = buffer_size.lock().await;

        // Update the mailbox size.
        let min_mailbox_size = 20;
        let messages_per_session = 2; // 1 request + 1 response
        let mailbox_size = min_mailbox_size + (*buffer_size * messages_per_session);

        // Update the buffer size.
        *buffer_size += msg.count * 2;

        tracing::info!(%buffer_size, "buffer_size_increased");

        drop(buffer_size);

        // Send the initial paths
        for _ in 0..msg.count {
          msg.recipient.try_send(issuer::messages::PathResponse {
            path: buffer_rx.recv().await?,
          })?;
        }

        Ok(mailbox_size)
      }
      .into_actor(self)
      .map(|res, _act, ctx| {
        match res.as_ref() {
          Ok(mailbox_size) => {
            ctx.set_mailbox_capacity(*mailbox_size);
          }
          Err(err) => {
            tracing::error!(error = %err, "start_issuing_failed");
          }
        }

        res
      }),
    )
  }
}
