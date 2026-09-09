use std::fmt::{Display, Formatter};

pub(super) type Result<T> = std::result::Result<T, Error>;

#[derive(Clone, Debug)]
pub(super) struct Error {
  reason: String,
}

impl Error {
  pub(super) fn new(reason: impl Into<String>) -> Self {
    Self {
      reason: reason.into(),
    }
  }
}

impl Display for Error {
  fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
    formatter.write_str(&self.reason)
  }
}

impl std::error::Error for Error {}
