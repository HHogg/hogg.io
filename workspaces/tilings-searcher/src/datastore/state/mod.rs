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

impl actix::Actor for Store {
  type Context = actix::Context<Self>;
}
