use actix::prelude::*;
use anyhow::Result;

use super::PathResponse;
use crate::datastore::{errors, tilings, visits};
use crate::issuer::{self, Issuer};
use crate::visitor;

#[derive(Clone, Debug)]
pub struct ProcessVisit {
  pub session_id: String,
  pub recipient: Recipient<PathResponse>,
  pub result: visitor::messages::VisitResult,
}

impl Message for ProcessVisit {
  type Result = Result<()>;
}

impl Handler<ProcessVisit> for Issuer {
  type Result = ResponseFuture<Result<()>>;

  fn handle(&mut self, msg: ProcessVisit, _ctx: &mut Self::Context) -> Self::Result {
    let buffer_rx = self.buffer_rx.clone();
    let visits_store_addr = self.visits_store_addr.clone();
    let tilings_store_addr = self.tilings_store_addr.clone();
    let errors_store_addr = self.errors_store_addr.clone();
    let leases = self.leases.clone();

    Box::pin(async move {
      // Send the searcher another path to search.
      if !buffer_rx.is_empty() {
        msg.recipient.try_send(issuer::messages::PathResponse {
          path: buffer_rx.recv().await?,
        })?;
      }

      // Release the lease
      let path_index = leases.lock().await.remove(&msg.result.path).unwrap_or(-1);

      // If the lease was not found, log a warning.
      if path_index == -1 {
        tracing::warn!(path = %msg.result.path, "lease_not_found");
      }

      // Store a record of the visit
      visits_store_addr
        .try_send(visits::messages::Insert {
          session_id: msg.session_id.clone(),
          path_index,
          result: msg.result.clone(),
        })
        .inspect_err(
          |error| tracing::error!(%error, path = %msg.result.path, "failed_to_store_visit"),
        )?;

      // Store the valid tilings found
      tilings_store_addr
        .try_send(tilings::messages::Insert {
          path: msg.result.path.clone(),
          path_index,
          results: msg.result.build_context.results.clone(),
        })
        .inspect_err(
          |error| tracing::error!(%error, path = %msg.result.path, "failed_to_store_tilings"),
        )?;

      // Store the application errors
      errors_store_addr
        .try_send(errors::messages::Insert {
          errors: msg.result.build_context.application_errors.clone(),
        })
        .inspect_err(
          |error| tracing::error!(%error, path = %msg.result.path, "failed_to_store_errors"),
        )?;

      tracing::info!(path = %msg.result.path, "processed_visit");

      Ok(())
    })
  }
}
