#[path = "./sibling_iterator_tests.rs"]
#[cfg(test)]
mod tests;

pub struct SiblingIterator<T>
where
  T: Iterator,
  T::Item: Clone,
{
  iter: T,
  previous: Option<T::Item>,
  current: Option<T::Item>,
  next: Option<T::Item>,
}

impl<T> Iterator for SiblingIterator<T>
where
  T: Iterator,
  T::Item: Clone,
{
  type Item = (Option<T::Item>, T::Item, Option<T::Item>);

  fn next(&mut self) -> Option<Self::Item> {
    self.previous = self.current.take();
    self.current = self.next.take();
    self.next = self.iter.next();

    if let Some(current) = self.current.clone() {
      Some((self.previous.clone(), current, self.next.clone()))
    } else {
      None
    }
  }
}

impl<T> From<T> for SiblingIterator<T>
where
  T: Iterator,
  T::Item: Clone,
{
  fn from(mut iter: T) -> Self {
    let next = iter.next();

    Self {
      iter,
      current: None,
      previous: None,
      next,
    }
  }
}
