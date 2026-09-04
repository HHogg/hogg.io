use crate::build::Plane;
use crate::notation::Notation;

type Case = (&'static str, u8);

fn create_hash((notation, repetitions): Case) -> String {
  let notation = Notation::default()
    .from_string(notation, false, false)
    .unwrap_or_else(|error| panic!("failed to parse {notation}: {error}"));
  let mut plane = Plane::default()
    .with_repetitions(repetitions)
    .from_notation(&notation)
    .unwrap_or_else(|error| {
      panic!("failed to build {notation} at {repetitions} repetitions: {error}")
    });

  plane
    .create_hash()
    .unwrap_or_else(|error| panic!("failed to hash {notation}: {error}"));

  plane
    .hash
    .as_ref()
    .expect("Plane::create_hash must populate Plane::hash")
    .to_string()
}

fn assert_hashes_are_implemented(hashes: &[String]) {
  assert!(
    hashes.iter().all(|hash| !hash.is_empty()),
    "Hash::build must produce a displayed identity"
  );
}

fn assert_same_hash(cases: &[Case]) {
  let hashes = cases.iter().copied().map(create_hash).collect::<Vec<_>>();
  assert_hashes_are_implemented(&hashes);

  for (case, hash) in cases.iter().zip(&hashes).skip(1) {
    assert_eq!(
      &hashes[0], hash,
      "{} should have the same hash as {}",
      case.0, cases[0].0
    );
  }
}

fn assert_different_hash(left: Case, right: Case) {
  let hashes = [create_hash(left), create_hash(right)];
  assert_hashes_are_implemented(&hashes);
  assert_ne!(
    hashes[0], hashes[1],
    "{} and {} must differ",
    left.0, right.0
  );
}

#[test]
fn square_translation_rotation_generator_and_supercell_are_equivalent() {
  assert_same_hash(&[
    ("4/m45/m(h1)", 3),
    ("4/m45/m(h2)", 3),
    ("4/m45/m(h3)", 3),
    ("4/r90/m(h1)", 3),
    ("4-4/m45/m(h2)", 3),
  ]);
}

#[test]
fn alternate_triangular_generators_are_equivalent() {
  assert_same_hash(&[("3/m30/m(h1)", 3), ("3/m60/m(h1)", 3), ("3/m30/r(h2)", 3)]);
}

#[test]
fn alternate_hexagonal_generators_are_equivalent() {
  assert_same_hash(&[("6/m30/m(h1)", 3), ("6/r60/m(h1)", 3), ("6-6/m30/r(h4)", 3)]);
}

#[test]
fn different_truncated_square_seeds_are_equivalent() {
  // The generator fixes circumradius, so this pair also exercises scale invariance.
  assert_same_hash(&[("4-8/m45/r(h5)", 3), ("8-4/m45/m(h4)", 3)]);
}

#[test]
fn different_snub_square_placement_patches_are_equivalent() {
  assert_same_hash(&[("4-3/r90/m(h2)", 3), ("4-3,3/r90/m(h2)", 3)]);
}

#[test]
fn reflected_snub_squares_are_equivalent() {
  // These are the two chiral embeddings, related by global reflection.
  assert_same_hash(&[("4-3-3,4/r90/r(h2)", 3), ("4-3-4,3/r90/r(h11)", 3)]);
}

#[test]
fn repetition_count_does_not_change_the_hash() {
  assert_same_hash(&[("4-3/m90/r(h2)", 2), ("4-3/m90/r(h2)", 5)]);
}

#[test]
fn different_bulk_face_ratios_produce_different_hashes() {
  // These have the same local vocabularies but asymptotic triangle:hexagon ratios 5:1 and 9:1.
  assert_different_hash(("3-3,3-6-6,6/m90/r(h2)", 3), ("3-3,3-3-3-6/m90/r(h1)", 3));
}

#[test]
fn distinct_triangle_hexagon_constructions_produce_different_hashes() {
  assert_different_hash(("6-3-3,3-3/r60/r(h13)", 3), ("6-3-3-3-3/m30/m(v3)", 3));
}

#[test]
fn explicit_hash_creation_is_idempotent() {
  let notation = Notation::default()
    .from_string("4/m45/m(h1)", false, false)
    .expect("square notation must parse");
  let mut plane = Plane::default()
    .with_repetitions(3)
    .from_notation(&notation)
    .expect("square plane must build");

  plane.create_hash().expect("first hash must build");
  let first = plane
    .hash
    .as_ref()
    .expect("hash must be stored")
    .to_string();
  plane.create_hash().expect("second hash must build");
  let second = plane
    .hash
    .as_ref()
    .expect("hash must be stored")
    .to_string();

  assert!(!first.is_empty());
  assert_eq!(first, second);
}

#[test]
fn non_periodic_plane_does_not_receive_a_hash() {
  let notation = Notation::default()
    .from_string("4", false, false)
    .expect("finite square notation must parse");
  let mut plane = Plane::default()
    .from_notation(&notation)
    .expect("finite square plane must build");

  assert!(plane.create_hash().is_err());
  assert!(plane.hash.is_none());
}
