mod error;
pub mod messages;
mod worker;

use actix::prelude::*;

pub use self::messages::Visit;
use self::worker::Worker;

pub struct Visitor {
  workers: Addr<Worker>,
}

impl Visitor {
  pub fn new(worker_count: usize) -> Self {
    Self {
      workers: actix::SyncArbiter::start(worker_count, Worker::default),
    }
  }
}

impl Actor for Visitor {
  type Context = Context<Self>;
}
