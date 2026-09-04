#[path = "./torus_tests.rs"]
#[cfg(test)]
mod tests;

use crate::utils::coordinate_equals;
use crate::{location, Fxx, ResizeMethod, SpatialGridMap};

#[derive(Clone, Copy, Debug, Default, Eq, Hash, Ord, PartialEq, PartialOrd)]
pub struct EntryId(usize);

impl EntryId {
  pub fn index(self) -> usize {
    self.0
  }
}

#[derive(Clone, Copy, Debug, Default, Eq, Hash, Ord, PartialEq, PartialOrd)]
pub struct Winding {
  pub x: i64,
  pub y: i64,
}

impl std::ops::Add for Winding {
  type Output = Self;

  fn add(self, other: Self) -> Self::Output {
    Self {
      x: self.x + other.x,
      y: self.y + other.y,
    }
  }
}

impl std::ops::Sub for Winding {
  type Output = Self;

  fn sub(self, other: Self) -> Self::Output {
    Self {
      x: self.x - other.x,
      y: self.y - other.y,
    }
  }
}

#[derive(Clone, Copy, Debug)]
pub struct NormalizedLocation {
  pub point: location::Point,
  pub winding: Winding,
}

#[derive(Clone, Debug)]
struct Entry<T> {
  point: location::Point,
  value: T,
}

/// A stable-ID spatial map for points on an axis-aligned rectangular torus.
///
/// Coordinates are normalized before they enter the underlying grid. Points
/// that compare equal using the project's coordinate tolerance share an ID,
/// including points that meet across a periodic boundary.
#[derive(Clone, Debug)]
pub struct ToroidalSpatialGridMap<T> {
  period: location::Point,
  grid: SpatialGridMap<EntryId>,
  entries: Vec<Entry<T>>,
}

impl<T> ToroidalSpatialGridMap<T> {
  pub fn new(id: &str, period: location::Point) -> Self {
    assert!(
      period.0.is_finite() && period.0 > 0.0,
      "toroidal x period must be finite and positive"
    );
    assert!(
      period.1.is_finite() && period.1 > 0.0,
      "toroidal y period must be finite and positive"
    );

    Self {
      period,
      grid: SpatialGridMap::new(id)
        .with_resize_method(ResizeMethod::Fixed)
        .with_spacing(1.0),
      entries: Vec::new(),
    }
  }

  pub fn unit(id: &str) -> Self {
    Self::new(id, location::Point(1.0, 1.0))
  }

  pub fn normalize(&self, point: location::Point) -> NormalizedLocation {
    let (x, winding_x) = normalize_axis(point.0, self.period.0);
    let (y, winding_y) = normalize_axis(point.1, self.period.1);

    NormalizedLocation {
      point: location::Point(x, y),
      winding: Winding {
        x: winding_x,
        y: winding_y,
      },
    }
  }

  pub fn intern(&mut self, point: location::Point, value: T) -> (EntryId, Winding, bool) {
    let normalized = self.normalize(point);

    if let Some(id) = self.grid.get_value(&normalized.point).copied() {
      return (id, normalized.winding, false);
    }

    let id = EntryId(self.entries.len());
    let inserted = self.grid.insert(normalized.point, 1.0, None, id);
    assert!(inserted, "a new toroidal point must receive a grid entry");
    self.entries.push(Entry {
      point: normalized.point,
      value,
    });

    (id, normalized.winding, true)
  }

  pub fn locate(&self, point: location::Point) -> Option<(EntryId, Winding)> {
    let normalized = self.normalize(point);
    self
      .grid
      .get_value(&normalized.point)
      .copied()
      .map(|id| (id, normalized.winding))
  }

  pub fn get(&self, id: EntryId) -> Option<&T> {
    self.entries.get(id.index()).map(|entry| &entry.value)
  }

  pub fn point(&self, id: EntryId) -> Option<location::Point> {
    self.entries.get(id.index()).map(|entry| entry.point)
  }

  pub fn lift(&self, id: EntryId, winding: Winding) -> Option<location::Point> {
    self.point(id).map(|point| {
      location::Point(
        point.0 + winding.x as Fxx * self.period.0,
        point.1 + winding.y as Fxx * self.period.1,
      )
    })
  }

  pub fn len(&self) -> usize {
    self.entries.len()
  }

  pub fn is_empty(&self) -> bool {
    self.entries.is_empty()
  }
}

fn normalize_axis(value: Fxx, period: Fxx) -> (Fxx, i64) {
  assert!(value.is_finite(), "toroidal coordinate must be finite");

  let quotient = (value / period).floor();
  assert!(
    quotient >= i64::MIN as Fxx && quotient <= i64::MAX as Fxx,
    "toroidal winding overflow"
  );

  let mut winding = quotient as i64;
  let mut normalized = value - quotient * period;

  if coordinate_equals(normalized, 0.0) {
    normalized = 0.0;
  } else if coordinate_equals(normalized, period) {
    normalized = 0.0;
    winding = winding.checked_add(1).expect("toroidal winding overflow");
  }

  (normalized, winding)
}
