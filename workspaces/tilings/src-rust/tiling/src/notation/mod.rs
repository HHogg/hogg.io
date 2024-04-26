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
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Notation {
  pub option_link_paths: bool,
  pub option_type_ahead: bool,
  pub option_with_first_transform: bool,

  #[typeshare(serialized_as = "String")]
  pub path: Path,
  #[typeshare(serialized_as = "String")]
  pub transforms: Transforms,
}

impl Notation {
  pub fn set_option_link_paths(&mut self, option_link_paths: bool) {
    self.option_link_paths = option_link_paths;
  }

  pub fn set_option_type_ahead(&mut self, option_type_ahead: bool) {
    self.option_type_ahead = option_type_ahead;
  }

  pub fn set_option_with_first_transform(&mut self, option_with_first_transform: bool) {
    self.option_with_first_transform = option_with_first_transform;
  }

  pub fn set_path(
    &mut self,
    path: Path,
    plane: &Plane,
    direction: &Direction,
  ) -> Result<(), TilingError> {
    self.path = path.clone();
    self.transforms = if self.transforms.list.is_empty() {
      Transforms::default().with_path(self.path.clone())
    } else {
      Transforms::first(path.clone(), &plane, direction)?
    };

    Ok(())
  }

  pub fn set_transforms(&mut self, transforms: Transforms) {
    self.transforms = transforms;
  }

  pub fn get_transform_count(&self) -> usize {
    self.transforms.list.len()
  }

  pub fn get_transform(&self, index: usize) -> Option<&Transform> {
    self.transforms.list.get(index)
  }

  ///
  pub fn from_string(&mut self, notation: String, plane: &Plane) -> Result<(), TilingError> {
    let mut sections = notation.split('/');
    let path_string = sections.next().unwrap();

    if path_string.is_empty() {
      if self.option_type_ahead {
        return Ok(());
      }

      return Err(TilingError::InvalidNotation {
        notation: String::default(),
        reason: "empty path".into(),
      });
    }

    // Parse the first part of the notation into
    // a path, and then add it to the tiling.
    let path = Path::default()
      .with_type_ahead(self.option_type_ahead)
      .from_string(path_string)?;

    self.set_path(path.clone(), &plane, &Direction::FromStart)?;

    // Keep parsing transform sections, building up
    // a list of transforms, and then add them to the
    // tiling.
    let mut transforms = Transforms::default().with_path(path);

    for transform_string in sections {
      if transform_string.is_empty() {
        return Err(TilingError::InvalidNotation {
          notation: notation.to_owned(),
          reason: "empty transform".into(),
        });
      }

      transforms.push_string(transform_string)?;
    }

    self.set_transforms(transforms);

    Ok(())
  }

  pub fn next(&mut self, plane: &Plane) -> Result<Option<()>, TilingError> {
    if !self.transforms.list.is_empty() || self.option_with_first_transform {
      if self.path.is_empty() {
        let next_path = self.path.next_path();
        self.set_path(next_path, &plane, &Direction::FromStart)?;
      }

      if let Some(next_transforms) = self.transforms.next(&plane, &self.path)? {
        self.set_transforms(next_transforms);
        return Ok(Some(()));
      }

      if !self.option_link_paths {
        return Ok(None);
      }
    }

    let next_path = self.path.next_path();
    self.set_path(next_path, &plane, &Direction::FromStart)?;

    Ok(Some(()))
  }

  pub fn previous(&mut self, plane: &Plane) -> Result<Option<()>, TilingError> {
    if !self.transforms.list.is_empty() || self.option_with_first_transform {
      if self.path.is_empty() {
        return Err(TilingError::Application {
          reason: "cannot call previous on a tiling without a path".into(),
        });
      }

      if let Some(previous_transforms) = self.transforms.previous(&plane, &self.path)? {
        self.set_transforms(previous_transforms);
        return Ok(Some(()));
      }

      if !self.option_link_paths {
        return Ok(None);
      }
    }

    if let Some(previous_path) = self.path.previous_path() {
      self.set_path(previous_path, &plane, &Direction::FromEnd)?;
      return Ok(Some(()));
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
