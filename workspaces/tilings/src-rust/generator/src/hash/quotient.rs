#[path = "./quotient_tests.rs"]
#[cfg(test)]
mod tests;

use std::collections::{BTreeMap, BTreeSet, VecDeque};

use hogg_geometry::{Affine2, Vector2};
use hogg_spatial_grid_map::{location, EntryId, ToroidalSpatialGridMap, Winding};

use crate::build::Plane;

use super::error::{Error, Result};
use super::isometry::{derive_periodicity, Lattice};

const MAX_LATTICE_REFINEMENTS: usize = 8;

#[derive(Clone, Debug)]
pub(super) struct ChamberGraph {
  pub(super) labels: Vec<u8>,
  pub(super) neighbors: Vec<[usize; 3]>,
}

pub(super) fn build(plane: &Plane, source: &[Affine2]) -> Result<ChamberGraph> {
  let periodicity = derive_periodicity(source)?;
  let mut lattice = periodicity.lattice;

  for _ in 0..MAX_LATTICE_REFINEMENTS {
    let quotient = collect_faces(plane, &periodicity.representatives, &lattice)?;
    let translations = find_extra_translations(&quotient.faces, &quotient.points);

    if translations.is_empty() {
      return build_graph(&quotient.faces);
    }

    let refined = lattice.refine_coordinates(&translations)?;

    if refined.area() >= lattice.area() * (1.0 - 0.000_001) {
      return Err(Error::new(
        "a translation symmetry was found but did not refine the lattice",
      ));
    }

    lattice = refined;
  }

  Err(Error::new(
    "translation lattice did not reach a maximal periodic quotient",
  ))
}

struct FaceQuotient {
  faces: Vec<FaceKey>,
  points: ToroidalSpatialGridMap<()>,
}

fn collect_faces(
  plane: &Plane,
  representatives: &[Affine2],
  lattice: &Lattice,
) -> Result<FaceQuotient> {
  let placement_tiles = plane.iter_placement_tiles().collect::<Vec<_>>();

  if placement_tiles.is_empty() {
    return Err(Error::new("the plane has no placement faces"));
  }

  let mut faces = BTreeSet::new();
  let mut point_map = ToroidalSpatialGridMap::unit("hash.quotient.points");

  for representative in representatives {
    for tile in &placement_tiles {
      let mut points = tile
        .geometry
        .points
        .iter()
        .map(|point| {
          let transformed = representative.apply(point);
          LiftedPoint::intern(
            lattice.coordinates(Vector2::from(transformed)),
            &mut point_map,
          )
        })
        .collect::<Result<Vec<_>>>()?;

      if representative.reverses_orientation() {
        points.reverse();
      }

      faces.insert(FaceKey::new(tile.shape.into(), &points)?);
    }
  }

  if faces.is_empty() {
    return Err(Error::new("the periodic quotient contains no faces"));
  }

  Ok(FaceQuotient {
    faces: faces.into_iter().collect(),
    points: point_map,
  })
}

fn find_extra_translations(faces: &[FaceKey], points: &ToroidalSpatialGridMap<()>) -> Vec<Vector2> {
  let Some(reference) = faces.first() else {
    return Vec::new();
  };

  let face_set = faces.iter().cloned().collect::<BTreeSet<_>>();
  let mut candidate_map = ToroidalSpatialGridMap::unit("hash.quotient.translations");
  let mut candidates = Vec::new();

  for target in faces.iter().filter(|face| face.sides == reference.sides) {
    for reference_point in &reference.points {
      for target_point in &target.points {
        let reference_vector = reference_point.vector(points);
        let target_vector = target_point.vector(points);
        let translation = target_vector - reference_vector;
        let (id, _, inserted) =
          candidate_map.intern(location::Point(translation.x, translation.y), ());
        let normalized = candidate_map
          .point(id)
          .expect("an interned translation must have a point");

        if inserted && (normalized.0 != 0.0 || normalized.1 != 0.0) {
          candidates.push(Vector2::new(normalized.0, normalized.1));
        }
      }
    }
  }

  candidates
    .into_iter()
    .filter(|translation| {
      faces.iter().all(|face| {
        face
          .translated(*translation, points)
          .is_ok_and(|translated| translated.is_some_and(|face| face_set.contains(&face)))
      })
    })
    .collect()
}

#[derive(Clone, Copy, Debug, Default, Eq, Ord, PartialEq, PartialOrd)]
struct LiftedPoint {
  id: EntryId,
  winding: Winding,
}

impl LiftedPoint {
  fn intern(vector: Vector2, points: &mut ToroidalSpatialGridMap<()>) -> Result<Self> {
    if !vector.x.is_finite() || !vector.y.is_finite() {
      return Err(Error::new("non-finite coordinate in periodic quotient"));
    }

    if vector.x.abs() > i64::MAX as f64 || vector.y.abs() > i64::MAX as f64 {
      return Err(Error::new("periodic quotient coordinate overflow"));
    }

    let (id, winding, _) = points.intern(location::Point(vector.x, vector.y), ());
    Ok(Self { id, winding })
  }

  fn vector(self, points: &ToroidalSpatialGridMap<()>) -> Vector2 {
    let point = points
      .lift(self.id, self.winding)
      .expect("a quotient point ID must remain valid");

    Vector2::new(point.0, point.1)
  }
}

#[derive(Clone, Debug, Eq, Ord, PartialEq, PartialOrd)]
struct FaceKey {
  sides: u8,
  points: Vec<LiftedPoint>,
}

impl FaceKey {
  fn new(sides: u8, points: &[LiftedPoint]) -> Result<Self> {
    if points.len() < 3 || points.len() != sides as usize {
      return Err(Error::new("invalid face cycle in periodic quotient"));
    }

    if points
      .iter()
      .enumerate()
      .any(|(index, point)| *point == points[(index + 1) % points.len()])
    {
      return Err(Error::new("periodic face contains a zero-length edge"));
    }

    let mut best: Option<Vec<LiftedPoint>> = None;

    for reversed in [false, true] {
      for start in 0..points.len() {
        let shift = points[start].winding;
        let candidate = (0..points.len())
          .map(|offset| {
            let index = if reversed {
              (points.len() + start - offset) % points.len()
            } else {
              (start + offset) % points.len()
            };

            LiftedPoint {
              id: points[index].id,
              winding: points[index].winding - shift,
            }
          })
          .collect::<Vec<_>>();

        if best.as_ref().is_none_or(|best| candidate < *best) {
          best = Some(candidate);
        }
      }
    }

    Ok(Self {
      sides,
      points: best.expect("a valid face has at least one canonical cycle"),
    })
  }

  fn translated(
    &self,
    translation: Vector2,
    point_map: &ToroidalSpatialGridMap<()>,
  ) -> Result<Option<Self>> {
    let mut points = Vec::with_capacity(self.points.len());

    for point in &self.points {
      let translated = point.vector(point_map) + translation;
      let Some((id, winding)) = point_map.locate(location::Point(translated.x, translated.y))
      else {
        return Ok(None);
      };

      points.push(LiftedPoint { id, winding });
    }

    Self::new(self.sides, &points).map(Some)
  }
}

#[derive(Clone, Copy, Debug, Eq, Ord, PartialEq, PartialOrd)]
struct DirectedEdgeKey {
  start: EntryId,
  end: EntryId,
  winding: Winding,
}

#[derive(Clone, Copy, Debug, Eq, Ord, PartialEq, PartialOrd)]
struct EdgeKey(DirectedEdgeKey);

impl EdgeKey {
  fn new(start: LiftedPoint, end: LiftedPoint) -> Self {
    let forward = DirectedEdgeKey {
      start: start.id,
      end: end.id,
      winding: end.winding - start.winding,
    };
    let reverse = DirectedEdgeKey {
      start: end.id,
      end: start.id,
      winding: start.winding - end.winding,
    };

    Self(forward.min(reverse))
  }
}

#[derive(Clone, Copy, Debug)]
struct EdgeOccurrence {
  face: usize,
  edge: usize,
  start: LiftedPoint,
  end: LiftedPoint,
}

fn build_graph(faces: &[FaceKey]) -> Result<ChamberGraph> {
  let mut edges = BTreeMap::<EdgeKey, Vec<EdgeOccurrence>>::new();
  let mut vertices = BTreeSet::new();
  let mut vertex_chambers = BTreeMap::<EntryId, Vec<usize>>::new();
  let mut face_offsets = Vec::with_capacity(faces.len());
  let mut chamber_count = 0_usize;

  for (face_index, face) in faces.iter().enumerate() {
    face_offsets.push(chamber_count);
    chamber_count += face.points.len() * 2;

    for (edge_index, start) in face.points.iter().copied().enumerate() {
      let end = face.points[(edge_index + 1) % face.points.len()];
      vertices.insert(start.id);
      edges
        .entry(EdgeKey::new(start, end))
        .or_default()
        .push(EdgeOccurrence {
          face: face_index,
          edge: edge_index,
          start,
          end,
        });
    }
  }

  if vertices.len() as i64 - edges.len() as i64 + faces.len() as i64 != 0 {
    return Err(Error::new(
      "periodic incidence quotient does not have torus Euler characteristic",
    ));
  }

  let mut graph = ChamberGraph {
    labels: Vec::with_capacity(chamber_count),
    neighbors: vec![[usize::MAX; 3]; chamber_count],
  };

  for (face_index, face) in faces.iter().enumerate() {
    let edge_count = face.points.len();

    for edge in 0..edge_count {
      let start = chamber(&face_offsets, face_index, edge, 0);
      let end = chamber(&face_offsets, face_index, edge, 1);
      vertex_chambers
        .entry(face.points[edge].id)
        .or_default()
        .push(start);
      vertex_chambers
        .entry(face.points[(edge + 1) % edge_count].id)
        .or_default()
        .push(end);
      graph.neighbors[start][0] = end;
      graph.neighbors[end][0] = start;

      let previous = chamber(
        &face_offsets,
        face_index,
        (edge + edge_count - 1) % edge_count,
        1,
      );
      let next = chamber(&face_offsets, face_index, (edge + 1) % edge_count, 0);
      graph.neighbors[start][1] = previous;
      graph.neighbors[end][1] = next;

      graph.labels.push(face.sides);
      graph.labels.push(face.sides);
    }
  }

  for occurrences in edges.values() {
    let [first, second] = occurrences.as_slice() else {
      return Err(Error::new(
        "every periodic edge orbit must have exactly two incident face sides",
      ));
    };
    let mapping = endpoint_mapping(first, second)?;

    for (first_endpoint, second_endpoint) in mapping.into_iter().enumerate() {
      let first_chamber = chamber(&face_offsets, first.face, first.edge, first_endpoint);
      let second_chamber = chamber(&face_offsets, second.face, second.edge, second_endpoint);

      graph.neighbors[first_chamber][2] = second_chamber;
      graph.neighbors[second_chamber][2] = first_chamber;
    }
  }

  validate_graph(&graph)?;
  validate_vertex_links(&graph, &vertex_chambers)?;
  Ok(graph)
}

fn chamber(face_offsets: &[usize], face: usize, edge: usize, endpoint: usize) -> usize {
  face_offsets[face] + edge * 2 + endpoint
}

fn endpoint_mapping(first: &EdgeOccurrence, second: &EdgeOccurrence) -> Result<[usize; 2]> {
  if first.start.id == second.start.id && first.end.id == second.end.id {
    let start_shift = second.start.winding - first.start.winding;
    let end_shift = second.end.winding - first.end.winding;

    if start_shift == end_shift {
      return Ok([0, 1]);
    }
  }

  if first.start.id == second.end.id && first.end.id == second.start.id {
    let start_to_end_shift = second.end.winding - first.start.winding;
    let end_to_start_shift = second.start.winding - first.end.winding;

    if start_to_end_shift == end_to_start_shift {
      return Ok([1, 0]);
    }
  }

  Err(Error::new(
    "paired periodic edge occurrences do not have matching endpoints",
  ))
}

fn validate_graph(graph: &ChamberGraph) -> Result<()> {
  if graph.labels.is_empty() || graph.labels.len() != graph.neighbors.len() {
    return Err(Error::new("empty or malformed chamber graph"));
  }

  for (chamber, neighbors) in graph.neighbors.iter().enumerate() {
    for (color, neighbor) in neighbors.iter().copied().enumerate() {
      if neighbor == usize::MAX || neighbor >= graph.neighbors.len() {
        return Err(Error::new("chamber involution is incomplete"));
      }

      if neighbor == chamber || graph.neighbors[neighbor][color] != chamber {
        return Err(Error::new("chamber involution is not reciprocal"));
      }
    }
  }

  let mut visited = vec![false; graph.neighbors.len()];
  let mut queue = VecDeque::from([0_usize]);
  visited[0] = true;

  while let Some(chamber) = queue.pop_front() {
    for neighbor in graph.neighbors[chamber] {
      if !visited[neighbor] {
        visited[neighbor] = true;
        queue.push_back(neighbor);
      }
    }
  }

  if visited.iter().any(|visited| !visited) {
    return Err(Error::new("periodic chamber graph is disconnected"));
  }

  Ok(())
}

fn validate_vertex_links(
  graph: &ChamberGraph,
  vertex_chambers: &BTreeMap<EntryId, Vec<usize>>,
) -> Result<()> {
  for chambers in vertex_chambers.values() {
    let chamber_set = chambers.iter().copied().collect::<BTreeSet<_>>();
    let mut visited = BTreeSet::new();
    let mut queue = VecDeque::from([chambers[0]]);
    visited.insert(chambers[0]);

    while let Some(chamber) = queue.pop_front() {
      for color in [1, 2] {
        let neighbor = graph.neighbors[chamber][color];

        if !chamber_set.contains(&neighbor) {
          return Err(Error::new(
            "a chamber involution does not preserve its vertex orbit",
          ));
        }

        if visited.insert(neighbor) {
          queue.push_back(neighbor);
        }
      }
    }

    if visited.len() != chambers.len() {
      return Err(Error::new("a periodic vertex link is disconnected"));
    }
  }

  Ok(())
}
