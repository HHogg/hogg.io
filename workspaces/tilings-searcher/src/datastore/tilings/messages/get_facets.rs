use actix::prelude::*;
use anyhow::Result;
use hogg_tiling_datastore::tilings::{self, get_facets};
use hogg_tiling_datastore::{Facet, ResponseMultiple};

use crate::datastore::tilings::Store;

pub struct GetFacets(pub tilings::get_facets::Request);

impl Message for GetFacets {
  type Result = Result<ResponseMultiple<Facet>>;
}

impl Handler<GetFacets> for Store {
  type Result = ResponseFuture<Result<ResponseMultiple<Facet>>>;

  fn handle(&mut self, message: GetFacets, _: &mut Context<Self>) -> Self::Result {
    let GetFacets(request) = message;
    let pool = self.pool.clone();

    Box::pin(async move { get_facets(&pool, request).await })
  }
}
