#[path = "./quotient_tests.rs"]
#[cfg(test)]
mod tests;

use std::collections::{BTreeMap, BTreeSet, VecDeque};

use hogg_geometry::{Affine2, Vector2};

use crate::build::Plane;

use super::error::{Error, Result};
use super::isometry::{derive_periodicity, Lattice};

const COORDINATE_SCALE: i64 = 1_000_000;
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
    let faces = collect_faces(plane, &periodicity.representatives, &lattice)?;
    let translations = find_extra_translations(&faces);

    if translations.is_empty() {
      return build_graph(&faces);
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

fn collect_faces(
  plane: &Plane,
  representatives: &[Affine2],
  lattice: &Lattice,
) -> Result<Vec<FaceKey>> {
  let placement_tiles = plane.iter_placement_tiles().collect::<Vec<_>>();

  if placement_tiles.is_empty() {
    return Err(Error::new("the plane has no placement faces"));
  }

  let mut faces = BTreeSet::new();

  for representative in representatives {
    for tile in &placement_tiles {
      let mut points = tile
        .geometry
        .points
        .iter()
        .map(|point| {
          let transformed = representative.apply(point);
          QPoint::from_vector(lattice.coordinates(Vector2::from(transformed)))
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

  Ok(faces.into_iter().collect())
}

fn find_extra_translations(faces: &[FaceKey]) -> Vec<Vector2> {
  let Some(reference) = faces.first() else {
    return Vec::new();
  };

  let face_set = faces.iter().cloned().collect::<BTreeSet<_>>();
  let mut candidates = BTreeSet::new();

  for target in faces.iter().filter(|face| face.sides == reference.sides) {
    for reference_point in &reference.points {
      for target_point in &target.points {
        let translation = (*target_point - *reference_point).modulo_lattice();

        if translation != QPoint::default() {
          candidates.insert(translation);
        }
      }
    }
  }

  candidates
    .into_iter()
    .filter(|translation| {
      faces.iter().all(|face| {
        face
          .translated(*translation)
          .is_ok_and(|translated| face_set.contains(&translated))
      })
    })
    .map(|translation| {
      Vector2::new(
        translation.x as f64 / COORDINATE_SCALE as f64,
        translation.y as f64 / COORDINATE_SCALE as f64,
      )
    })
    .collect()
}

#[derive(Clone, Copy, Debug, Default, Eq, Ord, PartialEq, PartialOrd)]
struct QPoint {
  x: i64,
  y: i64,
}

impl QPoint {
  fn from_vector(vector: Vector2) -> Result<Self> {
    if !vector.x.is_finite() || !vector.y.is_finite() {
      return Err(Error::new("non-finite coordinate in periodic quotient"));
    }

    let x = vector.x * COORDINATE_SCALE as f64;
    let y = vector.y * COORDINATE_SCALE as f64;

    if x.abs() > i64::MAX as f64 || y.abs() > i64::MAX as f64 {
      return Err(Error::new("periodic quotient coordinate overflow"));
    }

    Ok(Self {
      x: x.round() as i64,
      y: y.round() as i64,
    })
  }

  fn modulo_lattice(self) -> Self {
    Self {
      x: self.x.rem_euclid(COORDINATE_SCALE),
      y: self.y.rem_euclid(COORDINATE_SCALE),
    }
  }

  fn lattice_cell(self) -> Self {
    Self {
      x: self.x.div_euclid(COORDINATE_SCALE),
      y: self.y.div_euclid(COORDINATE_SCALE),
    }
  }

  fn is_lattice_vector(self) -> bool {
    self.x.rem_euclid(COORDINATE_SCALE) == 0 && self.y.rem_euclid(COORDINATE_SCALE) == 0
  }
}

impl std::ops::Add for QPoint {
  type Output = Self;

  fn add(self, other: Self) -> Self::Output {
    Self {
      x: self.x + other.x,
      y: self.y + other.y,
    }
  }
}

impl std::ops::Sub for QPoint {
  type Output = Self;

  fn sub(self, other: Self) -> Self::Output {
    Self {
      x: self.x - other.x,
      y: self.y - other.y,
    }
  }
}

#[derive(Clone, Debug, Eq, Ord, PartialEq, PartialOrd)]
struct FaceKey {
  sides: u8,
  points: Vec<QPoint>,
}

impl FaceKey {
  fn new(sides: u8, points: &[QPoint]) -> Result<Self> {
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

    let mut best: Option<Vec<QPoint>> = None;

    for reversed in [false, true] {
      for start in 0..points.len() {
        let first = points[start];
        let cell = first.lattice_cell();
        let shift = QPoint {
          x: cell.x * COORDINATE_SCALE,
          y: cell.y * COORDINATE_SCALE,
        };
        let candidate = (0..points.len())
          .map(|offset| {
            let index = if reversed {
              (points.len() + start - offset) % points.len()
            } else {
              (start + offset) % points.len()
            };

            points[index] - shift
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

  fn translated(&self, translation: QPoint) -> Result<Self> {
    let points = self
      .points
      .iter()
      .map(|point| *point + translation)
      .collect::<Vec<_>>();

    Self::new(self.sides, &points)
  }
}

#[derive(Clone, Copy, Debug, Eq, Ord, PartialEq, PartialOrd)]
struct DirectedEdgeKey {
  start: QPoint,
  delta: QPoint,
}

#[derive(Clone, Copy, Debug, Eq, Ord, PartialEq, PartialOrd)]
struct EdgeKey(DirectedEdgeKey);

impl EdgeKey {
  fn new(start: QPoint, end: QPoint) -> Self {
    let forward = DirectedEdgeKey {
      start: start.modulo_lattice(),
      delta: end - start,
    };
    let reverse = DirectedEdgeKey {
      start: end.modulo_lattice(),
      delta: start - end,
    };

    Self(forward.min(reverse))
  }
}

#[derive(Clone, Copy, Debug)]
struct EdgeOccurrence {
  face: usize,
  edge: usize,
  start: QPoint,
  end: QPoint,
}

fn build_graph(faces: &[FaceKey]) -> Result<ChamberGraph> {
  let mut edges = BTreeMap::<EdgeKey, Vec<EdgeOccurrence>>::new();
  let mut vertices = BTreeSet::new();
  let mut vertex_chambers = BTreeMap::<QPoint, Vec<usize>>::new();
  let mut face_offsets = Vec::with_capacity(faces.len());
  let mut chamber_count = 0_usize;

  for (face_index, face) in faces.iter().enumerate() {
    face_offsets.push(chamber_count);
    chamber_count += face.points.len() * 2;

    for (edge_index, start) in face.points.iter().copied().enumerate() {
      let end = face.points[(edge_index + 1) % face.points.len()];
      vertices.insert(start.modulo_lattice());
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
        .entry(face.points[edge].modulo_lattice())
        .or_default()
        .push(start);
      vertex_chambers
        .entry(face.points[(edge + 1) % edge_count].modulo_lattice())
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

    for first_endpoint in 0..2 {
      let second_endpoint = mapping[first_endpoint];
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
  let start_shift = second.start - first.start;
  let end_shift = second.end - first.end;

  if start_shift == end_shift && start_shift.is_lattice_vector() {
    return Ok([0, 1]);
  }

  let start_to_end_shift = second.end - first.start;
  let end_to_start_shift = second.start - first.end;

  if start_to_end_shift == end_to_start_shift && start_to_end_shift.is_lattice_vector() {
    return Ok([1, 0]);
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
  vertex_chambers: &BTreeMap<QPoint, Vec<usize>>,
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
