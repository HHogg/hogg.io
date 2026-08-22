pub use super::Version;
pub use crate::{FeatureToggle, Tiling};

fn get_versions_to_test() -> [Version; 1] {
  [Version::V1]
}

fn get_notation_groups_to_test() -> Vec<Vec<&'static str>> {
  return vec![
    vec!["3/m30/m(h1)", "3/m30/r(h2)"],
    vec!["4/m45/m(h1)", "4/m45/m(h2)", "4/r90/m(h1)", "4-4/m45/m(h2)"],
    vec![
      "6/m30/m(h1)",
      "6/r60/m(h1)",
      "6-6/m30/r(h4)",
      "6-6/m30/r(h11)",
    ],
  ];
}

fn create_hash(notation: &'static str, version: &Version) -> String {
  let tiling = Tiling::default()
    .with_feature_toggles([FeatureToggle::Hashing])
    .with_hash_version(version.clone())
    .with_repetitions(3)
    .from_string(notation);

  return tiling.result.hash;
}

fn test_hashes_for_version(version: &Version) {
  let mut hashes: Vec<(&str, String)> = vec![];

  for notation_group in get_notation_groups_to_test().iter() {
    let first_notation = notation_group.get(0).expect("notation in group");
    let first_hash = create_hash(first_notation, version);

    hashes.push((first_notation, first_hash.clone()));

    for notation in notation_group.iter().skip(1) {
      let hash = create_hash(notation, version);

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
fn test_hash_versions() {
  for version in get_versions_to_test().iter() {
    test_hashes_for_version(&version);
  }
}
