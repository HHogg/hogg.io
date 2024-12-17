#[path = "./tiling_tests.rs"]
#[cfg(test)]
mod tests;

use core::fmt;

use serde::de::{self, MapAccess, Visitor};
use serde::{Deserialize, Deserializer, Serialize};
use serde_with::{serde_as, DisplayFromStr};
use typeshare::typeshare;

use crate::build::Metrics;
use crate::notation::{Direction, Notation, Path, Transforms};
use crate::{build, validation, TilingError};

#[serde_as]
#[derive(Clone, Debug, Default, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Tiling {
  #[typeshare(serialized_as = "String")]
  pub notation: Notation,
  pub plane: build::Plane,
  pub result: Option<build::Result>,
  #[typeshare(serialized_as = "String")]
  #[serde_as(as = "DisplayFromStr")]
  #[serde(skip_deserializing)]
  pub error: TilingError,
}

impl Tiling {
  pub fn with_expansion_phases(mut self, expansion_phases: u8) -> Self {
    self.plane.with_expansion_phases(expansion_phases);
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

  pub fn with_path(mut self, path: Path) -> Self {
    if let Err(err) = self
      .notation
      .set_path(path, &self.plane, &Direction::FromStart)
    {
      self.error = err;
    }

    self
  }

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

  pub fn with_metrics(mut self, metrics: Metrics) -> Self {
    self.plane.with_metrics(metrics);
    self
  }

  pub fn with_plane(mut self, plane: build::Plane) -> Self {
    self.plane = plane;
    self
  }

  pub fn with_notation(mut self, notation: String) -> Self {
    if let Err(err) = self.notation.from_string(notation.clone(), &self.plane) {
      self.error = err;
    }

    self
  }

  pub fn from_string(mut self, notation: String) -> Self {
    self = self.with_notation(notation);

    if let Err(err) = self.build(&None) {
      self.error = err;
    }

    self
  }

  pub fn find_previous_tiling(&mut self, on_visit: Option<&dyn Fn(String)>) -> Option<Notation> {
    match self.go_to_previous(&on_visit) {
      Ok(notation) => notation,
      Err(err) => {
        self.error = err;
        None
      }
    }
  }

  pub fn find_next_tiling(&mut self, on_visit: Option<&dyn Fn(String)>) -> Option<Notation> {
    match self.go_to_next(&on_visit) {
      Ok(notation) => notation,
      Err(err) => {
        self.error = err;
        None
      }
    }
  }

  fn go_to_previous(
    &mut self,
    on_visit: &Option<&dyn Fn(String)>,
  ) -> Result<Option<Notation>, TilingError> {
    loop {
      if self.notation.previous(&self.plane)?.is_none() {
        return Ok(None);
      }

      let build_result = self.build(on_visit);

      if build_result.is_ok() {
        return Ok(Some(self.notation.clone()));
      }
    }
  }

  fn go_to_next(
    &mut self,
    on_visit: &Option<&dyn Fn(String)>,
  ) -> Result<Option<Notation>, TilingError> {
    loop {
      if self.notation.next(&self.plane)?.is_none() {
        return Ok(None);
      }

      let build_result = self.build(on_visit);

      if build_result.is_ok() {
        return Ok(Some(self.notation.clone()));
      }
    }
  }

  pub fn build(&mut self, on_visit: &Option<&dyn Fn(String)>) -> Result<(), TilingError> {
    let build_result = self.plane.build(&self.notation);

    self.result = Some(self.into());

    if let Some(on_visit) = on_visit {
      on_visit(self.notation.to_string());
    }

    build_result
  }
}

struct TilingDeserializerVisitor;

impl<'de> Visitor<'de> for TilingDeserializerVisitor {
  type Value = Tiling;

  fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
    formatter.write_str("a JSON object with specific fields")
  }

  fn visit_map<V>(self, mut map: V) -> Result<Self::Value, V::Error>
  where
    V: MapAccess<'de>,
  {
    let mut notation: Option<String> = None;
    let mut plane: Option<build::Plane> = None;

    while let Some(key) = map.next_key()? {
      let key: String = key;

      match key.as_str() {
        "notation" => notation = Some(map.next_value()?),
        "plane" => plane = Some(map.next_value()?),
        _ => {
          let _: de::IgnoredAny = map.next_value()?;
        }
      }
    }

    let notation = notation.ok_or_else(|| de::Error::missing_field("notation"))?;
    let plane = plane.ok_or_else(|| de::Error::missing_field("plane"))?;

    Ok(Tiling::default().with_notation(notation).with_plane(plane))
  }
}

impl<'de> Deserialize<'de> for Tiling {
  fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
  where
    D: Deserializer<'de>,
  {
    deserializer.deserialize_map(TilingDeserializerVisitor)
  }
}
