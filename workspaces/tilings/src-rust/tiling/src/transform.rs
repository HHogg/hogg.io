#[path = "./transform_tests.rs"]
#[cfg(test)]
mod tests;

use std::fmt::Display;
use std::hash::Hash;
use std::str::FromStr;

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use super::{Operation, OriginIndex, OriginType, Path, TilingError, TransformValue};
use crate::path::Direction;
use crate::{Polygons, TransformContinuous, TransformEccentric};

#[derive(Clone, Debug, Eq, Deserialize, Serialize)]
#[typeshare]
#[serde(tag = "type", content = "content")]
#[serde(rename_all = "camelCase")]
pub enum Transform {
  Continuous(TransformContinuous),
  Eccentric(TransformEccentric),
}

impl Transform {
  pub fn from_string(string: &str, path: &Path) -> Result<Self, TilingError> {
    if let Some(operation_string) = &string.get(0..1) {
      let operation: Operation = operation_string.parse()?;

      match &string.get(1..2) {
        // Continuous
        Some(v) if v.parse::<usize>().is_ok() => {
          let seed = path.get_seed().ok_or(TilingError::InvalidNotation {
            notation: String::default(),
            reason: "no seed shape".into(),
          })?;

          return Ok(
            TransformContinuous {
              operation,
              value: TransformValue::default()
                .with_seed(*seed)
                .with_operation(operation)
                .from_string(&string[1..])?,
            }
            .into(),
          );
        }
        // Eccentric
        Some("(") => {
          let mut param_state = 0;
          let mut origin_type = None;
          let mut origin_index = None;

          for (index, char) in string[1..].chars().enumerate() {
            if char == '(' {
              param_state = 1;
              continue;
            } else if char == ')' {
              param_state = -1;
              continue;
            }

            if param_state == 0 {
              return Err(TilingError::InvalidTransform {
                transform: string.into(),
                reason: "unexpected character before open parenthesis".into(),
              });
            } else if param_state == -1 {
              return Err(TilingError::InvalidTransform {
                transform: string.into(),
                reason: "unexpected character after closing parenthesis".into(),
              });
            }

            if origin_type.is_none() {
              origin_type = Some(OriginType::from_str(char.to_string().as_str())?);
              continue;
            }

            if origin_index.is_none() {
              let mut origin_index_string = String::new();

              for char in string[index + 1..].chars() {
                if char == ')' {
                  break;
                }

                origin_index_string.push(char);
              }

              origin_index = Some(OriginIndex::from_str(origin_index_string.as_str())?);
            }
          }

          if let (Some(origin_type), Some(origin_index)) = (origin_type, origin_index) {
            return Ok(
              TransformEccentric {
                operation,
                origin_type,
                origin_index,
              }
              .into(),
            );
          }
        }
        // Invalid transform (catch at the end)
        _ => {}
      }
    }

    Err(TilingError::InvalidTransform {
      transform: string.into(),
      reason: "failed to parse".into(),
    })
  }

  pub fn previous(&mut self, polygons: &Polygons) -> Option<Self> {
    match self {
      Self::Continuous(transform) => transform.previous().map(|transform| transform.into()),
      Self::Eccentric(transform) => {
        transform
          .previous(polygons)
          .map(|transform| transform.into())
      }
    }
  }

  pub fn next(&mut self, polygons: &Polygons) -> Option<Self> {
    match self {
      Self::Continuous(transform) => transform.next().map(|transform| transform.into()),
      Self::Eccentric(transform) => transform.next(polygons).map(|transform| transform.into()),
    }
  }

  pub fn reset(
    &mut self,
    polygons: &Polygons,
    path: &Path,
    direction: &Direction,
  ) -> Result<Self, TilingError> {
    match self {
      Self::Continuous(_) => Ok(TransformContinuous::first(path, direction)?.into()),
      Self::Eccentric(_) => Ok(TransformEccentric::first(polygons, direction).into()),
    }
  }
}

impl From<TransformContinuous> for Transform {
  fn from(transform: TransformContinuous) -> Self {
    Self::Continuous(transform)
  }
}

impl From<TransformEccentric> for Transform {
  fn from(transform: TransformEccentric) -> Self {
    Self::Eccentric(transform)
  }
}

impl Display for Transform {
  fn fmt(&self, fmt: &mut std::fmt::Formatter) -> Result<(), std::fmt::Error> {
    write!(
      fmt,
      "{}",
      match self {
        Self::Continuous(transform) => transform.to_string(),
        Self::Eccentric(transform) => transform.to_string(),
      }
    )
  }
}

impl Hash for Transform {
  fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
    self.to_string().hash(state);
  }
}

impl PartialEq for Transform {
  fn eq(&self, other: &Self) -> bool {
    self.to_string() == other.to_string()
  }
}
