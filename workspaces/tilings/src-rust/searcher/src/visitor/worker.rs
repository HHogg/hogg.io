use std::cell::RefCell;

use actix::prelude::*;
use anyhow::Result;
use hogg_tiling_generator::{ApplicationError, FeatureToggle, Tiling, TilingError};

use super::messages::VisitResult;
use super::Visit;

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
      .with_feature_toggles(Some(FeatureToggle::all()))
      .with_repetitions(3)
      .with_path(path.clone())
      .with_first_transform();

    let visit_result = RefCell::new(VisitResult::default().with_path(path));

    while let Some(result) =
      tiling.find_next_tiling(Some(&|result: &hogg_tiling_generator::build::Result| {
        visit_result.borrow_mut().increment_total_tilings();

        if let Some(TilingError::Application { reason }) = result.error.as_ref() {
          visit_result
            .borrow_mut()
            .add_application_error(ApplicationError {
              tiling: result.notation.clone(),
              reason: reason.clone(),
            });
        }
      }))?
    {
      visit_result.borrow_mut().add_valid_tiling(result);
    }

    sender.try_send(visit_result.into_inner())?;

    Ok(())
  }
}
