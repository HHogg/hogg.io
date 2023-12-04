#[path = "./transforms_tests.rs"]
#[cfg(test)]
mod tests;

use std::fmt::Display;

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use crate::path::Direction;
use crate::{
  Path,
  Polygons,
  Separator,
  TilingError,
  Transform,
  TransformContinuous,
  TransformEccentric,
};

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(into = "String")]
#[typeshare]
pub struct Transforms {
  pub path: Path,
  pub index: i32,
  pub list: Vec<Transform>,
}

impl Transforms {
  pub fn first(
    path: Path,
    polygons: &Polygons,
    direction: &Direction,
  ) -> Result<Self, TilingError> {
    Ok(Self {
      path: path.clone(),
      index: 0,
      list: vec![
        TransformContinuous::first(&path, direction)?.into(),
        TransformEccentric::first(polygons, direction).into(),
      ],
    })
  }

  pub fn with_path(mut self, path: Path) -> Self {
    self.path = path;
    self.list = vec![];
    self
  }

  pub fn from_string(mut self, string: &str) -> Result<Self, TilingError> {
    string
      .to_string()
      .split(Separator::Transform.to_string().as_str())
      .try_for_each(|s| self.push_string(s))?;

    Ok(self)
  }

  pub fn push_string(&mut self, string: &str) -> Result<(), TilingError> {
    self.list.push(Transform::from_string(string, &self.path)?);
    Ok(())
  }

  pub fn previous(
    &mut self,
    polygons: &Polygons,
    path: &Path,
  ) -> Result<Option<Self>, TilingError> {
    if self.list.is_empty() {
      return Ok(Some(Self::first(
        path.clone(),
        polygons,
        &Direction::FromEnd,
      )?));
    }

    for (transform_index, transform) in self.list.iter().enumerate().rev() {
      if let Some(previous) = transform.clone().previous(polygons) {
        self.replace_transform(
          transform_index,
          previous,
          polygons,
          path,
          &Direction::FromEnd,
        )?;

        self.index -= 1;

        return Ok(Some(self.clone()));
      }
    }

    Ok(None)
  }

  pub fn next(&mut self, polygons: &Polygons, path: &Path) -> Result<Option<Self>, TilingError> {
    if self.list.is_empty() {
      return Ok(Some(Self::first(
        path.clone(),
        polygons,
        &Direction::FromStart,
      )?));
    }

    for (transform_index, transform) in self.list.iter().enumerate().rev() {
      if let Some(next) = transform.clone().next(polygons) {
        self.replace_transform(transform_index, next, polygons, path, &Direction::FromStart)?;
        self.index += 1;
        return Ok(Some(self.clone()));
      }
    }

    Ok(None)
  }

  fn replace_transform(
    &mut self,
    transform_index: usize,
    transform: Transform,
    polygons: &Polygons,
    path: &Path,
    direction: &Direction,
  ) -> Result<(), TilingError> {
    self.list[transform_index] = transform.clone();
    self.reset_from(transform_index + 1, polygons, path, direction)
  }

  fn reset_from(
    &mut self,
    transform_index: usize,
    polygons: &Polygons,
    path: &Path,
    direction: &Direction,
  ) -> Result<(), TilingError> {
    for transform in self.list.iter_mut().skip(transform_index) {
      *transform = transform.clone().reset(polygons, path, direction)?;
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

impl From<Transforms> for String {
  fn from(value: Transforms) -> Self {
    value.to_string()
  }
}
