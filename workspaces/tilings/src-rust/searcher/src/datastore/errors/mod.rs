use actix::prelude::*;
use sqlx::PgPool;

pub mod messages;

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
