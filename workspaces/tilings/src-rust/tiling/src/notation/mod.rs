mod direction;
mod offset;
mod operation;
mod origin_index;
mod origin_type;
mod path;
mod seed;
mod separator;
mod shape;
mod transform;
mod transform_continuous;
mod transform_eccentric;
mod transform_value;
mod transforms;

use std::fmt::Display;

use serde::Serialize;
use typeshare::typeshare;

pub use self::direction::Direction;
pub use self::offset::Offset;
pub use self::operation::Operation;
pub use self::origin_index::OriginIndex;
pub use self::origin_type::OriginType;
pub use self::path::{Node, Path};
pub use self::seed::Seed;
pub use self::separator::Separator;
pub use self::shape::Shape;
pub use self::transform::Transform;
pub use self::transform_continuous::TransformContinuous;
pub use self::transform_eccentric::TransformEccentric;
pub use self::transform_value::TransformValue;
pub use self::transforms::Transforms;
use crate::build::Plane;
use crate::TilingError;

#[derive(Clone, Debug, Default, Serialize)]
#[serde(into = "String")]
#[typeshare]
pub struct Notation {
  pub path: Path,
  pub path_plane: Plane,
  pub transforms: Transforms,
}

impl Notation {
  pub fn with_path(
    mut self,
    path: Path,
    direction: Direction,
    with_first_transform: bool,
  ) -> Result<Self, TilingError> {
    self.path = path;

    self.path_plane = Plane::default();
    self.path_plane.build(&Notation {
      path: self.path.clone(),
      ..Self::default()
    })?;

    if with_first_transform {
      self.transforms = Transforms::first(&self.path, &Some(&self.path_plane), &direction)?;
    } else {
      self.transforms = Transforms::default();
    }

    Ok(self)
  }

  pub fn with_transforms(mut self, transforms: Transforms) -> Self {
    self.transforms = transforms;
    self
  }

  pub fn get_seed_shape(&self) -> Option<Shape> {
    self.path.get_seed().map(|seed| seed.shape)
  }

  pub fn iter_shapes(&self) -> impl Iterator<Item = &Shape> {
    self.path.iter_shapes()
  }

  pub fn get_transform_count(&self) -> usize {
    self.transforms.list.len()
  }

  pub fn get_transform(&self, index: usize) -> Option<&Transform> {
    self.transforms.list.get(index)
  }

  pub fn from_string(
    &mut self,
    notation: &str,
    with_first_transform: bool,
    with_type_ahead: bool,
  ) -> Result<Self, TilingError> {
    let mut sections = notation.split('/');
    let path_string = sections.next().unwrap();

    if path_string.is_empty() {
      if with_type_ahead {
        return Ok(Self::default());
      }

      return Err(TilingError::InvalidNotation {
        notation: String::default(),
        reason: "empty path".into(),
      });
    }

    // Parse the first part of the notation into
    // a path, and then add it to the tiling.
    let path = Path::default().from_string(path_string, with_type_ahead)?;

    // Keep parsing transform sections, building up
    // a list of transforms, and then add them to the
    // tiling.
    let mut transforms = Transforms::default();

    for transform_string in sections {
      if transform_string.is_empty() {
        return Err(TilingError::InvalidNotation {
          notation: notation.to_owned(),
          reason: "empty transform".into(),
        });
      }

      transforms.push_string(&path, transform_string)?;
    }

    Ok(
      self
        .clone()
        .with_path(path, Direction::FromStart, with_first_transform)?
        .with_transforms(transforms),
    )
  }

  pub fn next(
    &self,
    with_first_transform: bool,
    with_link_paths: bool,
  ) -> Result<Option<Self>, TilingError> {
    if self.path.is_empty() {
      return self
        .clone()
        .with_path(
          Path::default().next_path(),
          Direction::FromStart,
          with_first_transform,
        )
        .map(Some);
    }

    if !self.transforms.list.is_empty() || with_first_transform {
      if let Some(next_transforms) = self.transforms.next(&self.path_plane, &self.path)? {
        return Ok(Some(self.clone().with_transforms(next_transforms)));
      }

      if !with_link_paths {
        return Ok(None);
      }
    }

    self
      .clone()
      .with_path(
        self.path.next_path(),
        Direction::FromStart,
        with_first_transform,
      )
      .map(Some)
  }

  pub fn previous(
    &self,
    with_first_transform: bool,
    with_link_paths: bool,
  ) -> Result<Option<Self>, TilingError> {
    if !self.transforms.list.is_empty() || with_first_transform {
      if self.path.is_empty() {
        return Err(TilingError::Application {
          reason: "cannot call previous on a tiling without a path".into(),
        });
      }

      if let Some(previous_transforms) = self.transforms.previous(&self.path_plane, &self.path)? {
        return Ok(Some(self.clone().with_transforms(previous_transforms)));
      }

      if !with_link_paths {
        return Ok(None);
      }
    }

    if let Some(previous_path) = self.path.previous_path() {
      return self
        .clone()
        .with_path(previous_path, Direction::FromEnd, with_first_transform)
        .map(Some);
    }

    Ok(None)
  }
}

impl Display for Notation {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    if !self.transforms.list.is_empty() {
      return write!(
        f,
        "{}{}{}",
        self.path,
        Separator::Transform,
        self.transforms
      );
    }

    write!(f, "{}", self.path)
  }
}

impl From<Notation> for String {
  fn from(notation: Notation) -> Self {
    notation.to_string()
  }
}
