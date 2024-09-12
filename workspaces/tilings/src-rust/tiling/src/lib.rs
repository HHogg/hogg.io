#![allow(clippy::approx_constant)]

pub mod build;
mod error;
pub mod geometry;
pub mod notation;
pub mod tiling;
pub mod utils;
pub mod validation;

pub use self::error::{ApplicationError, TilingError};
pub use self::tiling::Tiling;
