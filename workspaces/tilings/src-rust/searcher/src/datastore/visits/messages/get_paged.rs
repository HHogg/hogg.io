use actix::prelude::*;
use anyhow::Result;
use hogg_tiling_datastore::visits::{get_paged, VisitsRequest};
use hogg_tiling_datastore::ResponseMultiple;

use crate::datastore::visits::{Store, Tree};

pub struct GetPaged(pub VisitsRequest);

impl Message for GetPaged {
  type Result = Result<ResponseMultiple<Tree>>;
}

impl Handler<GetPaged> for Store {
  type Result = ResponseFuture<Result<ResponseMultiple<Tree>>>;

  fn handle(&mut self, message: GetPaged, _: &mut Context<Self>) -> Self::Result {
    let GetPaged(request) = message;
    let pool = self.pool.clone();

    Box::pin(async move {
      let response = get_paged(&pool, &request).await?;

      Ok(ResponseMultiple {
        page: request.page,
        page_size: request.page_size,
        total: response.total,
        results: response
          .results
          .into_iter()
          .map(Tree::from_visit)
          .collect::<Result<Vec<_>, _>>()?,
      })
    })
  }
}
