pub mod messages;

use actix::prelude::*;
use sqlx::PgPool;

const DURATION_REFRESH_MATERIALIZED_VIEWS: std::time::Duration = std::time::Duration::from_secs(60);

#[derive(Debug)]
pub struct Store {
  pub pool: PgPool,
  pub refresh_materialized_views: bool,
}

impl Store {
  pub fn new(pool: PgPool, refresh_materialized_views: bool) -> Self {
    Self {
      pool,
      refresh_materialized_views,
    }
  }

  fn start_refreshing_materialized_views(&mut self, ctx: &mut Context<Self>) {
    ctx.run_interval(DURATION_REFRESH_MATERIALIZED_VIEWS, |_act, ctx| {
      ctx.notify(messages::RefreshPerLevel);
      ctx.notify(messages::RefreshPerMinute);
      ctx.notify(messages::RefreshPerSession);
    });
  }
}

impl Actor for Store {
  type Context = Context<Self>;

  fn started(&mut self, ctx: &mut Self::Context) {
    if self.refresh_materialized_views {
      self.start_refreshing_materialized_views(ctx);
    }
  }
}
