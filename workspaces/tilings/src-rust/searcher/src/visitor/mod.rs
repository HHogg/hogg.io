mod error;
pub mod messages;
mod worker;

use actix::prelude::*;

pub use self::error::VisitError;
pub use self::messages::{Visit, VisitResult};
use self::worker::Worker;

pub struct Visitor {
  workers: Addr<Worker>,
}

impl Visitor {
  pub fn new(worker_count: usize) -> Self {
    Self {
      workers: actix::SyncArbiter::start(worker_count, move || Worker::default()),
    }
  }
}

impl Actor for Visitor {
  type Context = Context<Self>;
}
