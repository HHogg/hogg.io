use actix::prelude::*;
use anyhow::Result;
use hogg_tiling_datastore::tilings::{get_paged, TilingsRequest};
use hogg_tiling_datastore::ResponseMultiple;

use crate::datastore::tilings::Store;

pub struct GetPaged(pub TilingsRequest);

impl Message for GetPaged {
  type Result = Result<ResponseMultiple<String>>;
}

impl Handler<GetPaged> for Store {
  type Result = ResponseFuture<Result<ResponseMultiple<String>>>;

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
          .map(|tiling| tiling.notation)
          .collect(),
      })
    })
  }
}
