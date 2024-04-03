use actix::prelude::*;
use anyhow::Result;
use tiling_datastore::visits::{get_facets, VisitsFacetsRequest};
use tiling_datastore::{Facet, ResponseMultiple};

use crate::datastore::visits::Store;

pub struct GetFacets(pub VisitsFacetsRequest);

impl Message for GetFacets {
  type Result = Result<ResponseMultiple<Facet>>;
}

impl Handler<GetFacets> for Store {
  type Result = ResponseFuture<Result<ResponseMultiple<Facet>>>;

  fn handle(&mut self, message: GetFacets, _: &mut Context<Self>) -> Self::Result {
    let GetFacets(request) = message;
    let pool = self.pool.clone();

    Box::pin(async move { get_facets(pool, request).await })
  }
}
