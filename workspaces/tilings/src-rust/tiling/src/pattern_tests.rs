use super::*;

#[test]
fn empty_path() {
  let p1 = Pattern([6, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  let p2 = Pattern([3, 6, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  let p3 = Pattern([3, 3, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

  let mut hash_set = HashSet::new();

  assert_eq!(hash_set.len(), 0);

  hash_set.insert(p1);
  hash_set.insert(p2);
  hash_set.insert(p3);

  assert_eq!(hash_set.len(), 1);
}
