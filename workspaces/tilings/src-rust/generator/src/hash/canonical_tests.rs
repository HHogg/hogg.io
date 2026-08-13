use super::encode;
use crate::hash::quotient::ChamberGraph;

fn graph() -> ChamberGraph {
  ChamberGraph {
    labels: vec![4; 4],
    neighbors: vec![[1, 2, 3], [0, 3, 2], [3, 0, 1], [2, 1, 0]],
  }
}

fn renumber(graph: &ChamberGraph, new_to_old: &[usize]) -> ChamberGraph {
  let mut old_to_new = vec![usize::MAX; new_to_old.len()];

  for (new, old) in new_to_old.iter().copied().enumerate() {
    old_to_new[old] = new;
  }

  ChamberGraph {
    labels: new_to_old.iter().map(|old| graph.labels[*old]).collect(),
    neighbors: new_to_old
      .iter()
      .map(|old| graph.neighbors[*old].map(|neighbor| old_to_new[neighbor]))
      .collect(),
  }
}

fn visit_permutations(values: &mut [usize], start: usize, visitor: &mut impl FnMut(&[usize])) {
  if start == values.len() {
    visitor(values);
    return;
  }

  for index in start..values.len() {
    values.swap(start, index);
    visit_permutations(values, start + 1, visitor);
    values.swap(start, index);
  }
}

fn graph_from_involutions(involutions: [[usize; 8]; 3]) -> ChamberGraph {
  ChamberGraph {
    labels: vec![4; 8],
    neighbors: (0..8)
      .map(|chamber| involutions.map(|involution| involution[chamber]))
      .collect(),
  }
}

#[test]
fn canonical_bytes_ignore_every_chamber_numbering() {
  let graph = graph();
  let expected = encode(&graph).unwrap();
  let mut permutation = (0..graph.neighbors.len()).collect::<Vec<_>>();
  let mut permutation_count = 0;

  visit_permutations(&mut permutation, 0, &mut |permutation| {
    assert_eq!(encode(&renumber(&graph, permutation)).unwrap(), expected);
    permutation_count += 1;
  });

  assert_eq!(permutation_count, 24);
}

#[test]
fn canonical_bytes_retain_face_labels() {
  let graph = graph();
  let mut relabelled = graph.clone();
  relabelled.labels[0] = 3;

  assert_ne!(encode(&graph).unwrap(), encode(&relabelled).unwrap());
}

#[test]
fn canonical_bytes_distinguish_same_label_non_isomorphic_graphs() {
  let cube = graph_from_involutions([
    [1, 0, 3, 2, 5, 4, 7, 6],
    [2, 3, 0, 1, 6, 7, 4, 5],
    [4, 5, 6, 7, 0, 1, 2, 3],
  ]);
  let twisted = graph_from_involutions([
    [1, 0, 3, 2, 5, 4, 7, 6],
    [2, 3, 0, 1, 6, 7, 4, 5],
    [4, 6, 5, 7, 0, 2, 1, 3],
  ]);

  assert_ne!(encode(&cube).unwrap(), encode(&twisted).unwrap());
}

#[test]
fn version_one_canonical_bytes_match_the_known_vector() {
  let canonical = encode(&graph()).unwrap();

  assert_eq!(
    hex::encode(&canonical),
    concat!(
      "686f67672d74696c696e672d68617368000100000004",
      "04000000010000000200000003",
      "04000000000000000300000002",
      "04000000030000000000000001",
      "04000000020000000100000000",
    )
  );
  assert_eq!(
    crate::hash::format_display(&canonical),
    "th1:1a924a242c48b1f95b7910eb6b568fc25a48597ead114c30d607c50fe28c88ef"
  );
}
