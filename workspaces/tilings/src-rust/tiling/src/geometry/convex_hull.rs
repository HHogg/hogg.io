#[path = "./convex_hull_tests.rs"]
#[cfg(test)]
mod tests;

use std::cmp::Ordering;

use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use crate::utils::math::{compare_coordinate, compare_radians, is_between_radians};

use super::{BBox, LineSegment, Point};

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct ConvexHull {
  pub points: Vec<Point>,
}

impl ConvexHull {
  pub fn from_line_segments<'a>(line_segments: impl Iterator<Item = &'a LineSegment>) -> Self {
    let mut points = line_segments
      // The second point of the line_segment will be the first point
      // of the next line_segment so we only need to take the first point
      .map(|line_segment| line_segment.start)
      .collect::<Vec<_>>();

    if points.len() < 3 {
      return Self::default();
    }

    // We'll perform the Graham's scan algorithm to find the convex hull
    // of the points

    // Find the point with the lowest y-coordinate, we could quite
    // easily also use the centroid of all the points too.
    let lowest_point = points
      .iter()
      .cloned()
      .max_by(|a, b| compare_coordinate(a.y, b.y))
      .expect("There should be at least one point");

    // Sort the points by their angle to the lowest point.
    // This gets all the points in order around the polygon.
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

  fn find_line_segment(&self, terminal_point: Point) -> Option<LineSegment> {
    let radians = terminal_point.radian_to_center();
    let points_count = self.points.len();

    for i in 0..points_count {
      let p1 = self.points[i];
      let p2 = self.points[(i + 1) % points_count];

      let p1_radians = p1.radian_to_center();
      let p2_radians = p2.radian_to_center();

      if is_between_radians(p1_radians, radians, p2_radians) {
        return Some(LineSegment::default().with_start(p1).with_end(p2));
      }
    }

    None
  }

  pub fn get_bbox_scale_value(&self, bbox: &BBox) -> f64 {
    if self.points.is_empty() {
      return 1.0;
    }

    let bbox_points: [Point; 4] = bbox.into();

    bbox_points
      .iter()
      .map(|origin| {
        // At this point, we're working with the assumption that the BBox is bigger
        // than the convex hull so we need a vector that goes from the origin outwards.
        let vector = LineSegment::default()
          .with_start(Point::default())
          // We scale the vector to the maximum radius of the BBox
          // so that it will intersect with an edge of the bbox.
          .with_end(*origin);

        // Using radians, we can find the 2 points on either
        // side of the vectors terminal point.
        let line_segment = self
          .find_line_segment(vector.end)
          .expect("Line segment not found");

        let intersection_point = line_segment
          .get_intersection_point(&vector)
          .expect("Intersection point not found");

        let origin_distance = origin.distance_to(&Point::default());
        let intersection_point_distance = intersection_point.distance_to(&Point::default());

        origin_distance / intersection_point_distance
      })
      .max_by(|a, b| compare_coordinate(*a, *b))
      .expect("There should be at least one point")
  }

  pub fn scale(&self, scale: f64) -> Self {
    ConvexHull {
      points: self.points.iter().map(|point| point.scale(scale)).collect(),
    }
  }

  pub fn rotate(&self, theta: f64, origin: Option<&Point>) -> Self {
    ConvexHull {
      points: self
        .points
        .iter()
        .map(|point| point.rotate(theta, origin))
        .collect(),
    }
  }
}

// Check if the points make a left turn by checking the sign of the cross product
fn is_left_turn(p1: Point, p2: Point, p3: Point) -> bool {
  compare_coordinate(
    (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x),
    0.0,
  ) == Ordering::Greater
}
