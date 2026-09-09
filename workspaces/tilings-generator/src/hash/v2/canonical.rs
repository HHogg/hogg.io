#[path = "./canonical_tests.rs"]
#[cfg(test)]
mod tests;

use std::collections::VecDeque;

use hogg_geometry::Affine2;

use crate::build::Plane;

use super::error::{Error, Result};
use super::quotient::{self, ChamberGraph};
use super::FORMAT_VERSION;

const FORMAT_DOMAIN: &[u8] = b"hogg-tiling-hash\0";

pub(super) fn build(plane: &Plane, source: &[Affine2]) -> Result<Vec<u8>> {
  encode(&quotient::build(plane, source)?)
}

fn encode(graph: &ChamberGraph) -> Result<Vec<u8>> {
  let chamber_count = u32::try_from(graph.neighbors.len())
    .map_err(|_| Error::new("too many chambers in periodic quotient"))?;
  let mut best: Option<Vec<u8>> = None;

  for root in 0..graph.neighbors.len() {
    let mut canonical_ids = vec![usize::MAX; graph.neighbors.len()];
    let mut order = Vec::with_capacity(graph.neighbors.len());
    let mut queue = VecDeque::new();
    canonical_ids[root] = 0;
    order.push(root);
    queue.push_back(root);

    while let Some(chamber) = queue.pop_front() {
      for neighbor in graph.neighbors[chamber] {
        if canonical_ids[neighbor] == usize::MAX {
          canonical_ids[neighbor] = order.len();
          order.push(neighbor);
          queue.push_back(neighbor);
        }
      }
    }

    if order.len() != graph.neighbors.len() {
      return Err(Error::new(
        "cannot canonicalize a disconnected chamber graph",
      ));
    }

    let mut bytes = Vec::with_capacity(FORMAT_DOMAIN.len() + 1 + 4 + order.len() * 13);
    bytes.extend_from_slice(FORMAT_DOMAIN);
    bytes.push(FORMAT_VERSION);
    bytes.extend_from_slice(&chamber_count.to_be_bytes());

    for chamber in order {
      bytes.push(graph.labels[chamber]);

      for neighbor in graph.neighbors[chamber] {
        let canonical_id = u32::try_from(canonical_ids[neighbor])
          .map_err(|_| Error::new("canonical chamber identifier overflow"))?;
        bytes.extend_from_slice(&canonical_id.to_be_bytes());
      }
    }

    if best.as_ref().is_none_or(|best| bytes < *best) {
      best = Some(bytes);
    }
  }

  best.ok_or_else(|| Error::new("cannot canonicalize an empty chamber graph"))
}
