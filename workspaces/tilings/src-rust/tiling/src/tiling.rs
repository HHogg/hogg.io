#[path = "./tiling_tests.rs"]
#[cfg(test)]
mod tests;

use serde::Serialize;
use serde_with::{serde_as, DisplayFromStr};
use typeshare::typeshare;

use crate::notation::{Direction, Notation, Path, Transforms};
use crate::{build, validation, TilingError};

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

  #[typeshare]
  pub notation: Notation,
  pub plane: build::Plane,
  pub build_context: build::Context,
  #[typeshare(serialized_as = "String")]
  #[serde_as(as = "DisplayFromStr")]
  pub error: TilingError,
}

impl Tiling {
  ///
  pub fn with_expansion_phases(mut self, expansion_phases: u8) -> Self {
    self.option_expansion_phases = expansion_phases;
    self
  }

  pub fn with_first_transform(mut self) -> Self {
    self.notation.set_option_with_first_transform(true);
    self
  }

  /// Sets a flag to control the behaviour of calling
  /// next on a tiling so that when on the last transform
  /// the tiling ticks over to the next path with transforms
  pub fn with_link_paths(mut self, link_paths: bool) -> Self {
    self.notation.set_option_link_paths(link_paths);
    self
  }

  ///
  pub fn with_path(mut self, path: Path) -> Self {
    if let Err(err) = self
      .notation
      .set_path(path, &self.plane, &Direction::FromStart)
    {
      self.error = err;
    }

    self
  }

  ///
  pub fn with_scale(mut self, scale: u8) -> Self {
    self.plane.with_scale(scale);
    self
  }

  ///
  pub fn with_transforms(mut self, transforms: Transforms) -> Self {
    self.notation.set_transforms(transforms);
    self
  }

  /// Sets a flag that allows the tiling to be built up
  /// with a notation that is not fully valid. This is
  /// useful to silence certain errors that relate
  /// to an incomplete notation
  pub fn with_type_ahead(mut self, type_ahead: bool) -> Self {
    self.notation.set_option_type_ahead(type_ahead);
    self
  }

  /// Setting this skips the validation that happens as
  /// the tiling is being built up. This should only be
  /// used when the notation provided is known to be valid,
  /// and can be used to speed up the process of building.
  pub fn with_validations(mut self, validations: Option<Vec<validation::Flag>>) -> Self {
    self.plane.with_validations(validations);
    self
  }

  pub fn from_string(mut self, notation: String) -> Self {
    if let Err(err) = self.notation.from_string(notation.clone(), &self.plane) {
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

  fn go_to_previous(&mut self) -> Result<Option<Self>, TilingError> {
    loop {
      if self.notation.previous(&self.plane)?.is_none() {
        return Ok(None);
      }

      let build_result = self.build();

      if build_result.is_ok() {
        return Ok(Some(self.clone()));
      }
    }
  }

  fn go_to_next(&mut self) -> Result<Option<Self>, TilingError> {
    loop {
      if self.notation.next(&self.plane)?.is_none() {
        return Ok(None);
      }

      let build_result = self.build();

      if build_result.is_ok() {
        return Ok(Some(self.clone()));
      }
    }
  }

  pub fn build(&mut self) -> Result<(), TilingError> {
    let build_result = self
      .plane
      .build(&self.notation, self.option_expansion_phases);

    self
      .build_context
      .add_result(&self.notation, &self.plane, &build_result);

    build_result
  }
}
