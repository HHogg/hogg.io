use serde::{Serialize, Serializer};
use tiling::notation::{Path, Transform};
use tiling::{Tiling, TilingError};
use tiling_datastore::visits::Visit;
use typeshare::typeshare;

#[derive(Debug, Default, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Tree {
  id: NodeId,
  count_total_children: Option<i32>,
  count_valid_children: Option<i32>,
  children: Vec<Tree>,
}

impl Tree {
  pub fn from_visit(visit: Visit) -> Result<Self, TilingError> {
    let path: Path = visit.path;

    let mut tree = Self {
      id: NodeId::Path(path.clone()),
      count_total_children: Some(visit.count_total_tilings),
      count_valid_children: Some(visit.valid_tilings.len() as i32),
      children: vec![],
    };

    for tiling_string in visit.valid_tilings.iter().cloned() {
      tree.insert(
        Tiling::default()
          .from_string(tiling_string)
          .notation
          .transforms
          .list
          .as_slice(),
      );
    }

    Ok(tree)
  }

  fn insert(&mut self, transforms: &[Transform]) {
    if let Some(transform) = transforms.first() {
      // Search for existing Transform child
      for child in self.children.iter_mut() {
        if child.id == NodeId::Transform(transform.clone()) {
          child.insert(&transforms[1..]);
          return;
        }
      }

      let mut tree = Tree {
        id: NodeId::Transform(transform.clone()),
        count_valid_children: None,
        count_total_children: None,
        children: vec![],
      };

      tree.insert(&transforms[1..]);

      self.children.push(tree);
    }
  }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
#[typeshare(serialized_as = "string")]
pub enum NodeId {
  Transform(Transform),
  Path(Path),
}

impl Serialize for NodeId {
  fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
    match self {
      NodeId::Transform(transform) => serializer.serialize_str(&transform.to_string()),
      NodeId::Path(path) => serializer.serialize_str(&path.to_string()),
    }
  }
}

impl Default for NodeId {
  fn default() -> Self {
    NodeId::Path(Path::default())
  }
}
