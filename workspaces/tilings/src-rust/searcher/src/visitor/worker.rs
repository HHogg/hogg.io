use std::cell::RefCell;

use actix::prelude::*;
use anyhow::Result;
use tiling::{validation, ApplicationError, Tiling, TilingError};

use super::{messages::VisitResult, Visit};

#[derive(Debug, Default)]
pub struct Worker {}

impl Actor for Worker {
  type Context = SyncContext<Self>;
}

impl Handler<Visit> for Worker {
  type Result = Result<()>;

  fn handle(&mut self, message: Visit, _ctx: &mut Self::Context) -> Self::Result {
    let Visit { path, sender } = message;

    let mut tiling = Tiling::default()
      .with_validations(Some(validation::Flag::all()))
      .with_expansion_phases(3)
      .with_path(path.clone())
      .with_first_transform();

    let visit_result = RefCell::new(VisitResult::default().with_path(path));

    while let Some(result) = tiling.find_next_tiling(Some(&|result: &tiling::build::Result| {
      visit_result.borrow_mut().increment_total_tilings();

      if let Some(TilingError::Application { reason }) = result.error.as_ref() {
        visit_result
          .borrow_mut()
          .add_application_error(ApplicationError {
            tiling: result.notation.clone(),
            reason: reason.clone(),
          });
      }
    }))? {
      visit_result.borrow_mut().add_valid_tiling(result);
    }

    sender.try_send(visit_result.into_inner())?;

    Ok(())
  }
}
