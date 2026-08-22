pub mod messages;
mod tree;

use actix::prelude::*;
use sqlx::PgPool;

pub use self::tree::Tree;

#[derive(Debug)]
pub struct Store {
  pub pool: PgPool,
}

impl Store {
  pub fn new(pool: PgPool) -> Self {
    Self { pool }
  }
}

impl Actor for Store {
  type Context = Context<Self>;
}
