#[path = "./tiling_tests.rs"]
#[cfg(test)]
mod tests;

use core::fmt;
use std::collections::HashMap;

use serde::de::{self, MapAccess, Visitor};
use serde::{Deserialize, Deserializer, Serialize};
use serde_with::serde_as;

use crate::build::{FeatureToggle, Plane};
use crate::notation::{Direction, Notation, Path};
use crate::{build, TilingError};

#[serde_as]
#[derive(Clone, Debug, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Tiling {
  pub notation: Notation,
  pub plane: build::Plane,
  pub result: build::Result,

  option_feature_toggles: HashMap<FeatureToggle, bool>,
  option_first_transform: bool,
  option_hashing: bool,
  option_link_paths: bool,
  option_repetitions: u8,
  option_type_ahead: bool,
}

impl Tiling {
  pub fn with_repetitions(mut self, repetitions: u8) -> Self {
    self.option_repetitions = repetitions;
    self
  }

  pub fn with_first_transform(mut self) -> Self {
    self.option_first_transform = true;
    self
  }

  pub fn with_feature_toggles(
    mut self,
    option_feature_toggles: Option<HashMap<FeatureToggle, bool>>,
  ) -> Self {
    self.option_feature_toggles = option_feature_toggles.unwrap_or_default();
    self.option_hashing = self
      .option_feature_toggles
      .get(&FeatureToggle::Hashing)
      .copied()
      .unwrap_or(false);
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

    if self.result.error.is_some() {
      return self;
    }

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
      .with_repetitions(self.option_repetitions)
      .with_feature_toggles(&self.option_feature_toggles);

    let mut build_result = self.plane.build(&self.notation);

    if self.option_hashing && build_result.error.is_none() {
      build_result.create_hash(self);
    }

    if let Some(on_visit) = on_visit {
      on_visit(&build_result);
    }

    if build_result.error.is_some() {
      Err(build_result.error.unwrap())
    } else {
      self.result = build_result;

      Ok(())
    }
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
