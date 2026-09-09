pub use super::Version;
pub use crate::{FeatureToggle, Tiling};

fn get_notation_groups_to_test(version: &Version) -> Vec<Vec<&'static str>> {
  let mut groups = vec![
    vec!["3/m30/m(h1)", "3/m60/m(h1)", "3/m30/r(h2)"],
    vec![
      "4/m45/m(h1)",
      "4/m45/m(h2)",
      "4/m45/m(h3)",
      "4/r90/m(h1)",
      "4-4/m45/m(h2)",
    ],
    vec![
      "6/m30/m(h1)",
      "6/r60/m(h1)",
      "6-6/m30/r(h4)",
      "6-6/m30/r(h11)",
    ],
    vec!["4-8/m45/r(h5)", "8-4/m45/m(h4)"],
    vec![
      "4-3/r90/m(h2)",
      "4-3,3/r90/m(h2)",
      "4-3-3,4/r90/r(h2)",
      "4-3-4,3/r90/r(h11)",
    ],
  ];

  if matches!(version, Version::V2) {
    // V1 merges each of these pairs because they share local vocabularies.
    // V2 must distinguish their complete periodic incidence structures.
    groups.extend([
      vec!["3-3,3-6-6,6/m90/r(h2)"],
      vec!["3-3,3-3-3-6/m90/r(h1)"],
      vec!["6-3-3,3-3/r60/r(h13)"],
      vec!["6-3-3-3-3/m30/m(v3)"],
    ]);
  }

  groups
}

fn create_hash(notation: &str, version: &Version, repetitions: u8) -> String {
  let tiling = Tiling::default()
    .with_feature_toggles([FeatureToggle::Hashing])
    .with_hash_version(version.clone())
    .with_repetitions(repetitions)
    .from_string(notation);

  assert!(
    tiling.result.error.is_none(),
    "Failed to hash {notation} with {version} at {repetitions} repetitions: {:?}",
    tiling.result.error
  );
  assert!(
    !tiling.result.hash.is_empty(),
    "Expected a nonempty {version} hash for {notation}"
  );

  tiling.result.hash
}

fn test_hashes_for_version(version: &Version) {
  let mut hashes: Vec<(&str, String)> = vec![];

  for notation_group in get_notation_groups_to_test(version).iter() {
    let first_notation = notation_group.get(0).expect("notation in group");
    let first_hash = create_hash(first_notation, version, 3);

    hashes.push((first_notation, first_hash.clone()));

    for notation in notation_group.iter().skip(1) {
      let hash = create_hash(notation, version, 3);

      assert_eq!(
        hash, first_hash,
        "Expected {first_notation} hash to equal {notation} hash
        ---
        Version: {version}
        {first_notation}: {first_hash}
        {notation}: {hash}"
      )
    }
  }

  for (a_index, (a_notation, a_hash)) in hashes.iter().enumerate() {
    for (b_notation, b_hash) in hashes.iter().skip(a_index + 1) {
      assert_ne!(
        a_hash, b_hash,
        "Expected {a_notation} hash not to equal {b_notation} hash
        --
        Version: {version}
        {a_notation}: {a_hash}
        {b_notation}: {b_hash}"
      )
    }
  }
}

#[test]
fn test_hash_v1() {
  test_hashes_for_version(&Version::V1);
}

#[test]
fn test_hash_v2() {
  test_hashes_for_version(&Version::V2);
}

#[test]
fn v2_hash_does_not_depend_on_repetitions() {
  for notation in ["4/m45/m(h1)", "4-3/m90/r(h2)"] {
    let expected = create_hash(notation, &Version::V2, 3);

    for repetitions in [0, 1, 2, 5] {
      assert_eq!(
        create_hash(notation, &Version::V2, repetitions),
        expected,
        "{notation} hash changed at {repetitions} repetitions"
      );
    }
  }
}

#[test]
fn v2_hash_creation_is_idempotent() {
  let mut tiling = Tiling::default()
    .with_feature_toggles([FeatureToggle::Hashing])
    .with_hash_version(Version::V2)
    .with_repetitions(3)
    .from_string("4/m45/m(h1)");
  assert!(tiling.result.error.is_none());
  let first = tiling.plane.hash.clone().expect("hash must be populated");

  tiling.plane.create_hash().expect("second hash must build");

  assert_eq!(tiling.plane.hash.as_ref(), Some(&first));
}

#[test]
fn v2_rejects_non_periodic_inputs_without_storing_a_hash() {
  let tiling = Tiling::default()
    .with_feature_toggles([FeatureToggle::Hashing])
    .with_hash_version(Version::V2)
    .from_string("4");

  assert!(matches!(
    tiling.result.error,
    Some(crate::TilingError::InvalidState { .. })
  ));
  assert!(tiling.result.hash.is_empty());
  assert!(tiling.plane.hash.is_none());
}

#[test]
fn v2_catalogue_notations_have_unique_hashes() {
  let catalogue = include_str!("../../../tilings/results/output_v2.csv");
  let mut hashes = std::collections::HashMap::new();

  // This catalogue predates the branch's toroidal-coordinate fix, so its
  // recorded digests are stale. Rebuild its notations to check uniqueness.
  // Notations can contain commas, so the final comma separates the hash.
  for line in catalogue.lines().skip(1) {
    let (notation, _) = line
      .rsplit_once(',')
      .expect("catalogue row must have a hash");
    let hash = create_hash(notation, &Version::V2, 3);
    let previous = hashes.insert(hash, notation);
    assert!(
      previous.is_none(),
      "{notation} has the same v2 hash as {}",
      previous.unwrap_or_default()
    );
  }
}
