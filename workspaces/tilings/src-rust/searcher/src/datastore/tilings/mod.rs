pub mod messages;

use actix::prelude::*;
use sqlx::PgPool;

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
