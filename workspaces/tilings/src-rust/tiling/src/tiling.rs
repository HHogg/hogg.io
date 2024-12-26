#[path = "./tiling_tests.rs"]
#[cfg(test)]
mod tests;

use core::fmt;

use serde::de::{self, MapAccess, Visitor};
use serde::{Deserialize, Deserializer, Serialize};
use serde_with::serde_as;
use typeshare::typeshare;

use crate::build::Plane;
use crate::notation::{Direction, Notation, Path};
use crate::{build, validation, TilingError};

#[serde_as]
#[derive(Clone, Debug, Default, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Tiling {
  #[typeshare(serialized_as = "String")]
  pub notation: Notation,
  pub plane: build::Plane,
  pub result: build::Result,

  option_expansion_phases: u8,
  option_first_transform: bool,
  option_link_paths: bool,
  option_type_ahead: bool,
  option_validations: Option<Vec<validation::Flag>>,
}

impl Tiling {
  pub fn with_expansion_phases(mut self, expansion_phases: u8) -> Self {
    self.option_expansion_phases = expansion_phases;
    self
  }

  pub fn with_first_transform(mut self) -> Self {
    self.option_first_transform = true;
    self
  }

  /// Sets a flag to control the behaviour of calling
  /// next on a tiling so that when on the last transform
  /// the tiling ticks over to the next path with transforms
  pub fn with_link_paths(mut self) -> Self {
    self.option_link_paths = true;
    self
  }

  /// Sets a flag that allows the tiling to be built up
  /// with a notation that is not fully valid. This is
  /// useful to silence certain errors that relate
  /// to an incomplete notation
  pub fn with_type_ahead(mut self) -> Self {
    self.option_type_ahead = true;
    self
  }

  /// Sets the path of the tiling to be built up
  pub fn with_path(mut self, path: Path) -> Self {
    let result =
      self
        .notation
        .clone()
        .with_path(path, Direction::FromStart, self.option_first_transform);

    match result {
      Ok(notation) => self.notation = notation,
      Err(err) => self.result.error = Some(err),
    }

    self
  }

  /// Setting this skips the validation that happens as
  /// the tiling is being built up. This should only be
  /// used when the notation provided is known to be valid,
  /// and can be used to speed up the process of building.
  pub fn with_validations(mut self, validations: Option<Vec<validation::Flag>>) -> Self {
    self.option_validations = validations;
    self
  }

  pub fn with_plane(mut self, plane: build::Plane) -> Self {
    self.plane = plane;
    self
  }

  pub fn with_notation(mut self, notation: &str) -> Self {
    let notation = self.notation.clone().from_string(
      notation,
      self.option_first_transform,
      self.option_type_ahead,
    );

    match notation {
      Ok(notation) => self.notation = notation,
      Err(err) => self.result.error = Some(err),
    }

    self
  }

  pub fn from_string(mut self, notation: &str) -> Self {
    self = self.with_notation(notation);

    if let Err(err) = self.build(&None) {
      self.result.error = Some(err);
    }

    self
  }

  pub fn find_previous_tiling(
    &mut self,
    on_visit: Option<&dyn Fn(&build::Result)>,
  ) -> Result<Option<Notation>, TilingError> {
    loop {
      if let Some(previous_notation) = self
        .notation
        .previous(self.option_first_transform, self.option_link_paths)?
      {
        self.notation = previous_notation;

        if self.build(&on_visit).is_ok() {
          return Ok(Some(self.notation.clone()));
        }
      } else {
        return Ok(None);
      }
    }
  }

  pub fn find_next_tiling(
    &mut self,
    on_visit: Option<&dyn Fn(&build::Result)>,
  ) -> Result<Option<&build::Result>, TilingError> {
    loop {
      if let Some(next_notation) = self
        .notation
        .next(self.option_first_transform, self.option_link_paths)?
      {
        self.notation = next_notation;

        if self.build(&on_visit).is_ok() {
          return Ok(Some(&self.result));
        }
      } else {
        return Ok(None);
      }
    }
  }

  pub fn build(&mut self, on_visit: &Option<&dyn Fn(&build::Result)>) -> Result<(), TilingError> {
    self.plane = Plane::default()
      .with_expansion_phases(self.option_expansion_phases)
      .with_validations(self.option_validations.clone());

    let build_result = self.plane.build(&self.notation);

    self.result = self.into();
    self.result.error = build_result.clone().err();

    if let Some(on_visit) = on_visit {
      on_visit(&self.result);
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

    Ok(
      Tiling::default()
        .with_notation(notation.as_str())
        .with_plane(plane),
    )
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
