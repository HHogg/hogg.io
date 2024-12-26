pub mod messages;

use actix::prelude::*;
use anyhow::Result;
use tiling_datastore::sessions::{Session, SysInfo};

use crate::datastore::sessions;
use crate::issuer::{self, Issuer};
use crate::visitor::{self, Visitor};

#[derive(Debug)]
pub struct Client {
  id: String,
  issuer_addr: Addr<Issuer>,
  sessions_store_addr: Addr<sessions::Store>,
  worker_count: usize,
  visitor: Addr<Visitor>,
}

impl Client {
  pub fn new(
    issuer_addr: Addr<Issuer>,
    sessions_store_addr: Addr<sessions::Store>,
    worker_count: usize,
  ) -> Self {
    Self {
      id: nanoid::nanoid!(),
      issuer_addr,
      sessions_store_addr,
      worker_count,
      visitor: Visitor::new(worker_count).start(),
    }
  }

  fn handle_start_client(&self, ctx: &Context<Self>) -> Result<()> {
    let session = Session::default()
      .with_id(self.id.clone())
      .with_worker_count(self.worker_count)
      .with_sys_info(SysInfo::default());

    self
      .sessions_store_addr
      .try_send(sessions::messages::Insert(session))?;

    self
      .issuer_addr
      .try_send(issuer::messages::StartIssuingTo {
        recipient: ctx.address().recipient(),
        count: self.worker_count,
      })?;

    Ok(())
  }
}

impl Actor for Client {
  type Context = Context<Self>;

  fn started(&mut self, ctx: &mut Self::Context) {
    if let Err(err) = self.handle_start_client(ctx) {
      tracing::error!(error = %err, "failed_to_start_search_client");
    }
  }
}

impl Handler<issuer::messages::PathResponse> for Client {
  type Result = Result<()>;

  fn handle(
    &mut self,
    msg: issuer::messages::PathResponse,
    ctx: &mut Self::Context,
  ) -> Self::Result {
    self.visitor.try_send(visitor::messages::Visit {
      sender: ctx.address().recipient(),
      path: msg.path.clone(),
    })?;

    Ok(())
  }
}

impl Handler<visitor::messages::VisitResult> for Client {
  type Result = Result<()>;

  fn handle(
    &mut self,
    msg: visitor::messages::VisitResult,
    ctx: &mut Self::Context,
  ) -> Self::Result {
    self.issuer_addr.try_send(issuer::messages::ProcessVisit {
      session_id: self.id.clone(),
      recipient: ctx.address().recipient(),
      result: msg,
    })?;

    Ok(())
  }
}
