#[path = "./path_tests.rs"]
#[cfg(test)]
mod tests;

use std::fmt::Display;
use std::str::FromStr;

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use super::{Direction, Seed, Separator, Shape};
use crate::utils::SiblingIterator;
use crate::{Tiling, TilingError};

///
#[derive(Clone, Debug, Default, Eq, Hash, PartialEq, Deserialize, Serialize)]
#[serde(into = "String", from = "String")]
#[typeshare]
pub struct Path {
  pub option_type_ahead: bool,
  pub nodes: Vec<Node>,
}

impl Path {
  /// Sets a flag that allows the tiling to be built up
  /// with a notation that is not fully valid. This is
  /// useful to silence certain errors that relate
  /// to an incomplete notation
  pub fn with_type_ahead(mut self, type_ahead: bool) -> Self {
    self.option_type_ahead = type_ahead;
    self
  }

  ///
  pub fn from_string(mut self, string: &str) -> Result<Self, TilingError> {
    if string.is_empty() {
      if self.option_type_ahead {
        return Ok(self);
      }

      return Err(TilingError::InvalidNotation {
        notation: String::default(),
        reason: "path is empty".into(),
      });
    }

    for (group_index, group_string) in string.split('-').enumerate() {
      match group_index {
        0 => self.parse_seed_shape_group(group_string)?,
        _ => self.parse_shape_group(group_string)?,
      }
    }

    Ok(self)
  }

  ///
  fn parse_seed_shape_group(&mut self, group: &str) -> Result<(), TilingError> {
    self.nodes.push(Seed::from_str(group)?.into());
    Ok(())
  }

  ///
  fn parse_shape_group(&mut self, group: &str) -> Result<(), TilingError> {
    let shapes: Vec<_> = group.split(',').collect();

    self.nodes.push(Separator::Group.into());

    for (shape_index, shape) in shapes.iter().enumerate() {
      if shape_index == shapes.len() - 1 && shape.is_empty() && self.option_type_ahead {
        return Ok(());
      }

      let shape = Shape::from_str(shape).map_err(|error| {
        TilingError::InvalidShapeInGroup {
          shape: shape.to_string(),
          group: group.to_string(),
          reason: error.to_string(),
        }
      })?;

      if shape_index > 0 {
        self.nodes.push(Separator::Shape.into());
      }

      self.nodes.push(shape.into());
    }

    Ok(())
  }

  pub fn has_shape(&self, shape: &Shape) -> bool {
    return self.nodes.iter().any(|node| {
      node == &Node::Seed(Seed::default().with_shape(*shape)) || node == &Node::Shape(*shape)
    });
  }

  pub fn is_empty(&self) -> bool {
    self.nodes.is_empty()
  }

  pub fn len(&self) -> u16 {
    self.nodes.len() as u16
  }

  pub fn get_level(&self) -> usize {
    self.get_shape_count()
  }

  pub fn get_shape_count(&self) -> usize {
    self
      .nodes
      .iter()
      .filter(|node| matches!(node, Node::Shape(_) | Node::Seed(_)))
      .count()
  }

  pub fn get_seed(&self) -> Option<&Seed> {
    self.nodes.first().and_then(|node| {
      match node {
        Node::Seed(seed) => Some(seed),
        Node::Shape(_) => None,
        Node::Separator(_) => None,
      }
    })
  }

  pub fn previous_path(&mut self) -> Option<Self> {
    'previous: loop {
      if self.nodes == vec![Seed::default().into()] {
        return None;
      }

      for (node_index, node) in self.nodes.iter().enumerate().rev() {
        if let Some(previous_node) = node.previous() {
          self.replace_node(node_index, previous_node, Direction::FromEnd);

          if self.is_valid().is_ok() {
            return Some(self.clone());
          }

          continue 'previous;
        }
      }

      self.remove_layer(Direction::FromEnd);

      if self.is_valid().is_ok() {
        return Some(self.clone());
      }
    }
  }

  pub fn next_path(&mut self) -> Self {
    'next: loop {
      if self.nodes.is_empty() {
        self.nodes = vec![Seed::default().into()];
        return self.clone();
      }

      for (node_index, node) in self.nodes.iter().enumerate().rev() {
        if let Some(next_node) = node.next() {
          self.replace_node(node_index, next_node, Direction::FromStart);

          if self.is_valid().is_ok() {
            return self.clone();
          }

          continue 'next;
        }
      }

      self.insert_layer(Direction::FromStart);

      if self.is_valid().is_ok() {
        return self.clone();
      }
    }
  }

  /// A valid path must meet all of the following
  /// - The seed shape must not be a 0
  /// - The seed shape group must only contain a single shape
  /// - A shape group must not end on a 0
  /// - A shape group must not be longer than the number of available line segments
  /// - The shapes must not overlap
  fn is_valid(&mut self) -> Result<bool, TilingError> {
    let mut group_index = 0;
    let sibling_iter: SiblingIterator<_> = self.nodes.iter().into();

    // We know from the possible vertex's that the only valid path that contains an
    // octagon must also include a square, and no other shape.
    if self.has_shape(&Shape::Octagon) && (self.nodes.len() > 3 || !self.has_shape(&Shape::Square))
    {
      return Err(TilingError::InvalidNotation {
        notation: self.to_string(),
        reason: "any path containing an 8, must contain only one other 4".into(),
      });
    }

    for (last_node, current_node, next_node) in sibling_iter {
      match (last_node, current_node, next_node) {
        (
          None,
          Node::Seed(Seed {
            shape: Shape::Skip, ..
          }),
          _,
        ) => {
          return Err(TilingError::InvalidShapeGroup {
            group: self.split_by_group()[group_index].to_string(),
            reason: "the seed shape cannot be a 0".into(),
          });
        }
        (Some(Node::Shape(Shape::Skip)), Node::Separator(Separator::Group), _) => {
          return Err(TilingError::InvalidShapeGroup {
            group: self.split_by_group()[group_index].to_string(),
            reason: "a shape group cannot end on a 0".into(),
          });
        }
        (_, Node::Shape(Shape::Skip), None) => {
          return Err(TilingError::InvalidShapeGroup {
            group: self.split_by_group()[group_index].to_string(),
            reason: "a shape group cannot end on a 0".into(),
          });
        }
        (_, Node::Separator(Separator::Shape), _) => {
          if group_index == 0 {
            return Err(TilingError::InvalidShapeGroup {
              group: self.split_by_group()[group_index].to_string(),
              reason: "the seed shape group can only contain a single shape".into(),
            });
          }
        }
        (_, Node::Separator(Separator::Group), _) => {
          group_index += 1;
        }
        _ => {}
      };
    }

    // Build the tiling and check for overlaps or that
    // line segments are available to place the shapes
    let tiling = Tiling::default().with_path(self.clone());
    if !matches!(tiling.error, TilingError::Noop) {
      return Err(tiling.error);
    }

    Ok(true)
  }

  fn split_by_group(&mut self) -> Vec<Path> {
    let mut paths = vec![];
    let mut path = Path::default();

    for node in self.nodes.iter() {
      match node {
        Node::Separator(Separator::Group) => {
          paths.push(path.clone());
          path = Path::default();
        }

        _ => {
          path.nodes.push(node.clone());
        }
      }
    }

    paths.push(path);
    paths
  }

  fn replace_node(&mut self, node_index: usize, node: Node, direction: Direction) {
    self.nodes[node_index] = node;
    self.reset_from(node_index + 1, direction)
  }

  fn reset_from(&mut self, node_index: usize, direction: Direction) {
    for node_index in node_index..self.nodes.len() {
      self.nodes[node_index] = self.nodes[node_index].reset(direction);
    }
  }

  fn insert_layer(&mut self, direction: Direction) {
    self.nodes.push(Separator::default().into());
    self.nodes.push(Shape::default().into());
    self.reset_from(0, direction)
  }

  fn remove_layer(&mut self, direction: Direction) {
    self.nodes.pop();
    self.nodes.pop();
    self.reset_from(0, direction)
  }
}

impl From<Shape> for Path {
  fn from(shape: Shape) -> Self {
    Self {
      nodes: vec![Seed::default().with_shape(shape).into()],
      ..Self::default()
    }
  }
}

impl Display for Path {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(
      f,
      "{}",
      self
        .nodes
        .iter()
        .map(|n| n.to_string())
        .collect::<Vec<_>>()
        .join("")
    )
  }
}

impl FromStr for Path {
  type Err = TilingError;

  fn from_str(s: &str) -> Result<Self, Self::Err> {
    Path::default().from_string(s)
  }
}

impl From<String> for Path {
  fn from(s: String) -> Self {
    s.parse().unwrap()
  }
}

impl From<Path> for String {
  fn from(value: Path) -> Self {
    value.to_string()
  }
}

#[derive(Debug, Deserialize, Clone, Hash, Serialize, PartialEq, Eq)]
pub enum Node {
  Seed(Seed),
  Separator(Separator),
  Shape(Shape),
}

impl Node {
  fn previous(&self) -> Option<Self> {
    match self {
      Self::Seed(seed) => seed.previous().map(|seed| seed.into()),
      Self::Separator(separator) => separator.previous().map(|separator| separator.into()),
      Self::Shape(shape) => shape.previous().map(|shape| shape.into()),
    }
  }

  fn next(&self) -> Option<Self> {
    match self {
      Self::Seed(seed) => seed.next().map(|seed| seed.into()),
      Self::Separator(separator) => separator.next().map(|separator| separator.into()),
      Self::Shape(shape) => shape.next().map(|shape| shape.into()),
    }
  }

  fn reset(&mut self, direction: Direction) -> Self {
    match self {
      Self::Seed(_) => Seed::first(direction).into(),
      Self::Separator(_) => Separator::first(direction).into(),
      Self::Shape(_) => Shape::first(direction).into(),
    }
  }
}

impl From<Seed> for Node {
  fn from(seed: Seed) -> Self {
    Self::Seed(seed)
  }
}

impl From<Separator> for Node {
  fn from(separator: Separator) -> Self {
    Self::Separator(separator)
  }
}

impl From<Shape> for Node {
  fn from(shape: Shape) -> Self {
    Self::Shape(shape)
  }
}
impl Display for Node {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match self {
      Self::Seed(n) => write!(f, "{n}"),
      Self::Separator(n) => write!(f, "{n}"),
      Self::Shape(n) => write!(f, "{n}"),
    }
  }
}
