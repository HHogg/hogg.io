use tiling::Path;

mod get;
mod set;

pub use get::get;
pub use set::set;

#[derive(Clone, Debug)]
pub struct State {
  pub path: Path,
  pub path_index: i32,
}
