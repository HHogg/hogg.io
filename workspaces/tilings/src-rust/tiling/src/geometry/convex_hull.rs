use std::cmp::Ordering;

use serde::{Deserialize, Serialize};
use spatial_grid_map::SpatialGridMap;

use crate::utils::math::{compare_coordinate, compare_radians};

use super::{LineSegment, Point};

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
pub struct ConvexHull {
  pub points: Vec<Point>,
}

impl ConvexHull {
  pub fn from_line_segments(line_segments: SpatialGridMap<LineSegment>) -> Self {
    let mut points = line_segments
      .iter_values()
      // The second point of the line_segment will be the first point
      // of the next line_segment so we only need to take the first point
      .map(|line_segment| line_segment.p1)
      .collect::<Vec<_>>();

    // We'll perform the Graham's scan algorithm to find the convex hull
    // of the points

    // Find the point with the lowest y-coordinate
    let lowest_point = points
      .iter()
      .cloned()
      .max_by(|a, b| compare_coordinate(a.y, b.y))
      .expect("ConvexHull: there should be at least one point");

    // Sort the points by the angle they make with the lowest point
    points.sort_by(|a, b| {
      let a_radians = lowest_point.radian_to(a);
      let b_radians = lowest_point.radian_to(b);

      compare_radians(a_radians, b_radians)
    });

    // The stack will hold the points that are part of the convex hull
    let mut stack = Vec::new();

    // Add the first two points to the stack
    for point in points {
      while stack.len() >= 2 {
        let top = stack.len() - 1;
        let second_top = stack.len() - 2;

        if is_left_turn(stack[second_top], stack[top], point) {
          break;
        }

        stack.pop();
      }

      stack.push(point);
    }

    ConvexHull { points: stack }
  }
}

// Check if the points make a left turn by checking the sign of the cross product
fn is_left_turn(p1: Point, p2: Point, p3: Point) -> bool {
  compare_coordinate(
    (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x),
    0.0,
  ) == Ordering::Greater
}
