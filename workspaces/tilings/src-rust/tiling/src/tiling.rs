#[path = "./tiling_tests.rs"]
#[cfg(test)]
mod tests;

use std::fmt::Display;

use serde::Serialize;
use serde_with::{serde_as, DisplayFromStr};
use typeshare::typeshare;

use crate::path::Direction;
use crate::{
  BBox,
  BuildContext,
  Path,
  Polygons,
  Separator,
  TilingError,
  Transform,
  Transforms,
  ValidTiling,
  ValidationFlag,
};

///
#[serde_as]
#[derive(Clone, Debug, Default, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Tiling {
  pub option_expansion_phases: u8,
  pub option_link_paths: bool,
  pub option_with_first_transform: bool,
  pub option_type_ahead: bool,

  #[typeshare(serialized_as = "String")]
  pub path: Path,
  #[typeshare(serialized_as = "String")]
  pub transforms: Transforms,
  pub build_context: BuildContext,

  #[typeshare(serialized_as = "String")]
  #[serde_as(as = "DisplayFromStr")]
  pub error: TilingError,
  pub polygons: Polygons,
}

impl Tiling {
  /// Sets a flag to control the behaviour of calling
  /// next on a tiling so that when on the last transform
  /// the tiling ticks over to the next path with transforms
  pub fn with_link_paths(mut self, link_paths: bool) -> Self {
    self.option_link_paths = link_paths;
    self
  }

  /// Setting this skips the validation that happens as
  /// the tiling is being built up. This should only be
  /// used when the notation provided is known to be valid,
  /// and can be used to speed up the process of building.
  pub fn with_validations(mut self, validations: Option<Vec<ValidationFlag>>) -> Self {
    self.polygons.with_validations(validations);
    self
  }

  ///
  pub fn with_scale(mut self, scale: u8) -> Self {
    self.polygons.with_scale(scale);
    self
  }

  /// Sets a flag that allows the tiling to be built up
  /// with a notation that is not fully valid. This is
  /// useful to silence certain errors that relate
  /// to an incomplete notation
  pub fn with_type_ahead(mut self, type_ahead: bool) -> Self {
    self.option_type_ahead = type_ahead;
    self
  }

  ///
  pub fn with_expansion_phases(mut self, expansion_phases: u8) -> Self {
    self.option_expansion_phases = expansion_phases;
    self
  }

  pub fn with_first_transform(mut self) -> Self {
    self.option_with_first_transform = true;
    self
  }

  ///
  pub fn with_path(mut self, path: Path) -> Self {
    // self.build_context = BuildContext::default();

    if let Err(err) = self.set_path(path, &Direction::FromStart) {
      self.error = err;
    }

    // else if let Err(err) = self.build() {
    //   self.error = err;
    // }

    self
  }

  pub fn with_transforms(mut self, transforms: Transforms) -> Self {
    // self.build_context = BuildContext::default();

    self.set_transforms(transforms);

    // if let Err(err) = self.build() {
    //   self.error = err;
    // }

    self
  }

  pub fn from_string(mut self, notation: String) -> Self {
    if let Err(err) = self.parse_string(notation.clone()) {
      self.error = err;
    } else if let Err(err) = self.build() {
      self.error = err;
    }

    self
  }

  pub fn find_previous_tiling(&mut self) -> Option<Self> {
    match self.go_to_previous() {
      Ok(previous_tiling) => previous_tiling,
      Err(err) => {
        self.error = err;
        None
      }
    }
  }

  pub fn find_next_tiling(&mut self) -> Option<Self> {
    match self.go_to_next() {
      Ok(next_tiling) => next_tiling,
      Err(err) => {
        self.error = err;
        None
      }
    }
  }

  fn set_path(&mut self, path: Path, direction: &Direction) -> Result<(), TilingError> {
    self.path = path.clone();
    self.transforms = if self.transforms.list.is_empty() {
      Transforms::default().with_path(self.path.clone())
    } else {
      Transforms::first(path.clone(), &self.polygons, direction)?
    };

    Ok(())
  }

  fn set_transforms(&mut self, transforms: Transforms) {
    self.transforms = transforms;
  }

  ///
  fn parse_string(&mut self, notation: String) -> Result<(), TilingError> {
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

    self.set_path(path.clone(), &Direction::FromStart)?;

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

  fn go_to_previous(&mut self) -> Result<Option<Self>, TilingError> {
    loop {
      if self.go_to_previous_notation()?.is_none() {
        return Ok(None);
      }

      let build_result = self.build();

      if build_result.is_ok() {
        return Ok(Some(self.clone()));
      }
    }
  }

  fn go_to_previous_notation(&mut self) -> Result<Option<()>, TilingError> {
    if !self.transforms.list.is_empty() || self.option_with_first_transform {
      if self.path.is_empty() {
        return Err(TilingError::Application {
          reason: "cannot call previous on a tiling without a path".into(),
        });
      }

      if let Some(previous_transforms) = self.transforms.previous(&self.polygons, &self.path)? {
        self.set_transforms(previous_transforms);
        return Ok(Some(()));
      }

      if !self.option_link_paths {
        return Ok(None);
      }
    }

    if let Some(previous_path) = self.path.previous_path() {
      self.set_path(previous_path, &Direction::FromEnd)?;
      return Ok(Some(()));
    }

    Ok(None)
  }

  fn go_to_next(&mut self) -> Result<Option<Self>, TilingError> {
    loop {
      if self.go_to_next_notation()?.is_none() {
        return Ok(None);
      }

      let build_result = self.build();

      if build_result.is_ok() {
        return Ok(Some(self.clone()));
      }
    }
  }

  fn go_to_next_notation(&mut self) -> Result<Option<()>, TilingError> {
    if !self.transforms.list.is_empty() || self.option_with_first_transform {
      if self.path.is_empty() {
        let next_path = self.path.next_path();
        self.set_path(next_path, &Direction::FromStart)?;
      }

      if let Some(next_transforms) = self.transforms.next(&self.polygons, &self.path)? {
        self.set_transforms(next_transforms);
        return Ok(Some(()));
      }

      if !self.option_link_paths {
        return Ok(None);
      }
    }

    let next_path = self.path.next_path();
    self.set_path(next_path, &Direction::FromStart)?;

    Ok(Some(()))
  }

  pub fn build(&mut self) -> Result<(), TilingError> {
    let build_result =
      self
        .polygons
        .build(&self.path, &self.transforms, self.option_expansion_phases);

    self.update_build_context(&build_result);

    build_result
  }

  fn update_build_context(&mut self, build_result: &Result<(), TilingError>) {
    let notation = self.to_string();

    self.build_context.incr();

    match build_result {
      Err(TilingError::Application { reason }) => {
        self
          .build_context
          .add_application_error(notation, reason.clone())
      }
      Ok(()) => {
        let valid_tiling = ValidTiling::from_tiling(self);
        self.build_context.add_valid_tiling(valid_tiling);
      }
      _ => {}
    }
  }

  pub fn get_bbox(&self) -> &BBox {
    &self.polygons.bbox
  }

  pub fn get_transform_count(&self) -> usize {
    self.transforms.list.len()
  }

  pub fn get_transform(&self, index: usize) -> Option<&Transform> {
    self.transforms.list.get(index)
  }
}

impl Display for Tiling {
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
