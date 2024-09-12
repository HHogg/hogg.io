#[path = "./visitor_tests.rs"]
#[cfg(test)]
mod tests;

pub struct Visitor {
  center: (i64, i64),
  radius: u8,

  current_radius: u8,
  current_point: Option<(i64, i64)>,
}

impl Visitor {
  pub fn new(point: (i64, i64), radius: u8) -> Self {
    Visitor {
      center: point,
      radius,

      current_radius: 0,
      current_point: None,
    }
  }
}

impl Iterator for Visitor {
  type Item = (i64, i64);

  fn next(&mut self) -> Option<Self::Item> {
    let (cx, cy) = self.center;
    let r = self.current_radius as i64;

    match self.current_point {
      // The first point we visit is the center.
      None => {
        self.current_point = Some((cx, cy));
      }
      // After the center, we visit the points on the spiral,
      // starting from the top left corner.
      Some((x, y)) if x == cx && y == cy => {
        self.current_point = Some((cx - 1, cy - 1));
        self.current_radius = 1
      }
      // Move right until we reach the top right corner.
      Some((x, y)) if x < cx + r && y == cy - r => {
        self.current_point = Some((x + 1, y));
      }
      // Move down until we reach the bottom right corner.
      Some((x, y)) if x == cx + r && y < cy + r => {
        self.current_point = Some((x, y + 1));
      }
      // Move left until we reach the bottom left corner.
      Some((x, y)) if x > cx - r && y == cy + r => {
        self.current_point = Some((x - 1, y));
      }
      // Move up until we reach the top left corner.
      Some((x, y)) if x == cx - r && y > cy - r + 1 => {
        self.current_point = Some((x, y - 1));
      }
      // Move to the next level of the spiral.
      Some((x, y)) if x == cx - r && y == cy - r + 1 => {
        // If we've reached the maximum radius, we're done.
        if self.current_radius == self.radius {
          return None;
        }

        self.current_radius += 1;
        self.current_point = Some((
          cx - self.current_radius as i64,
          cy - self.current_radius as i64,
        ));
      }
      _ => {
        return None;
      }
    };

    self.current_point
  }
}
