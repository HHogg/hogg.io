#[path = "./transforms_tests.rs"]
#[cfg(test)]
mod tests;

use std::fmt::Display;

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use super::{Direction, Path, Separator, Transform, TransformContinuous, TransformEccentric};
use crate::build::Plane;
use crate::TilingError;

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(into = "String", from = "String")]
#[typeshare]
pub struct Transforms {
  pub index: i32,
  pub list: Vec<Transform>,
}

impl Transforms {
  pub fn first(
    path: &Path,
    plane: &Option<&Plane>,
    direction: &Direction,
  ) -> Result<Self, TilingError> {
    Ok(Self {
      index: 0,
      list: vec![
        TransformContinuous::first(path, direction)?.into(),
        TransformEccentric::first(plane, direction).into(),
      ],
    })
  }

  pub fn from_string(mut self, path: &Path, string: &str) -> Result<Self, TilingError> {
    string
      .split(Separator::Transform.to_string().as_str())
      .try_for_each(|s| self.push_string(path, s))?;

    Ok(self)
  }

  pub fn push_string(&mut self, path: &Path, string: &str) -> Result<(), TilingError> {
    self.list.push(Transform::from_string(string, path)?);
    Ok(())
  }

  pub fn len(&self) -> usize {
    self.list.len()
  }

  pub fn is_empty(&self) -> bool {
    self.list.is_empty()
  }

  pub fn previous(&self, plane: &Plane, path: &Path) -> Result<Option<Self>, TilingError> {
    if self.list.is_empty() {
      return Ok(Some(Self::first(path, &Some(plane), &Direction::FromEnd)?));
    }

    for (transform_index, transform) in self.list.iter().enumerate().rev() {
      if let Some(previous) = transform.clone().previous(plane) {
        let mut cloned = self.clone();

        cloned.replace_transform(
          transform_index,
          previous,
          &Some(plane),
          path,
          &Direction::FromEnd,
        )?;

        cloned.index -= 1;

        return Ok(Some(cloned));
      }
    }

    Ok(None)
  }

  pub fn next(&self, plane: &Plane, path: &Path) -> Result<Option<Self>, TilingError> {
    if self.list.is_empty() {
      return Ok(Some(Self::first(
        path,
        &Some(plane),
        &Direction::FromStart,
      )?));
    }

    for (transform_index, transform) in self.list.iter().enumerate().rev() {
      if let Some(next) = transform.clone().next(plane) {
        let mut cloned = self.clone();

        cloned.replace_transform(
          transform_index,
          next,
          &Some(plane),
          path,
          &Direction::FromStart,
        )?;

        cloned.index += 1;

        return Ok(Some(cloned));
      }
    }

    Ok(None)
  }

  fn replace_transform(
    &mut self,
    transform_index: usize,
    transform: Transform,
    plane: &Option<&Plane>,
    path: &Path,
    direction: &Direction,
  ) -> Result<(), TilingError> {
    self.list[transform_index] = transform.clone();
    self.reset_from(transform_index + 1, plane, path, direction)
  }

  fn reset_from(
    &mut self,
    transform_index: usize,
    plane: &Option<&Plane>,
    path: &Path,
    direction: &Direction,
  ) -> Result<(), TilingError> {
    for transform in self.list.iter_mut().skip(transform_index) {
      *transform = transform.clone().reset(plane, path, direction)?;
    }

    Ok(())
  }
}

impl Display for Transforms {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(
      f,
      "{}",
      self
        .list
        .iter()
        .map(|t| t.to_string())
        .collect::<Vec<_>>()
        .join(Separator::Transform.to_string().as_str())
    )
  }
}

impl From<String> for Transforms {
  fn from(value: String) -> Self {
    Self::default()
      .from_string(&Path::default(), value.as_str())
      .expect("Failed to parse transforms")
  }
}

impl From<Transforms> for String {
  fn from(value: Transforms) -> Self {
    value.to_string()
  }
}
