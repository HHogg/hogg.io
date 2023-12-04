use super::*;

#[test]
fn handles_1_element() {
  let list = vec!["A"];
  let mut scanner: SiblingIterator<_> = list.iter().cloned().into();

  assert_eq!(scanner.next(), Some((None, "A", None)));
  assert_eq!(scanner.next(), None);
}

#[test]
fn handles_2_elements() {
  let list = vec!["A", "B"];
  let mut scanner: SiblingIterator<_> = list.iter().cloned().into();

  assert_eq!(scanner.next(), Some((None, "A", Some("B"))));
  assert_eq!(scanner.next(), Some((Some("A"), "B", None)));
  assert_eq!(scanner.next(), None);
}

#[test]
fn handles_3_elements() {
  let list = vec!["A", "B", "C"];
  let mut scanner: SiblingIterator<_> = list.iter().cloned().into();

  assert_eq!(scanner.next(), Some((None, "A", Some("B"))));
  assert_eq!(scanner.next(), Some((Some("A"), "B", Some("C"))));
  assert_eq!(scanner.next(), Some((Some("B"), "C", None)));
  assert_eq!(scanner.next(), None);
}

#[test]
fn handles_4_elements() {
  let list = vec!["A", "B", "C", "D"];
  let mut scanner: SiblingIterator<_> = list.iter().cloned().into();

  assert_eq!(scanner.next(), Some((None, "A", Some("B"))));
  assert_eq!(scanner.next(), Some((Some("A"), "B", Some("C"))));
  assert_eq!(scanner.next(), Some((Some("B"), "C", Some("D"))));
  assert_eq!(scanner.next(), Some((Some("C"), "D", None)));
  assert_eq!(scanner.next(), None);
}
