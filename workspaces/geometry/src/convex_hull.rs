#[path = "./convex_hull_tests.rs"]
#[cfg(test)]
mod tests;

use hogg_spatial_grid_map::utils::Fxx;
use ordered_float::OrderedFloat;
use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use super::{point::sort_points_around_origin, BBox, LineSegment, Point};

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

    // Find the center point of all the points as the
    // origin to sort all the points by their angle to the origin.
    let origin = points
      .iter()
      .cloned()
      .min_by(|a, b| OrderedFloat(a.y).cmp(&OrderedFloat(b.y)))
      .expect("There should be at least one point");

    // Sort the points by their angle to the lowest point.
    // This gets all the points in order around the polygon.
    sort_points_around_origin(&mut points, &origin);

    // The stack will hold the points that are part of the convex hull
    let mut stack = Vec::new();

    for point in points {
      while stack.len() >= 2 {
        let a = stack.len() - 2;
        let b = stack.len() - 1;

        if is_left_turn(stack[a], stack[b], point) {
          break;
        }

        stack.pop();
      }

      stack.push(point);
    }

    // At the moment the points are sorted in a counter-clockwise order
    // around the origin. We need to put them in order around the origin
    // of the plane.
    sort_points_around_origin(&mut stack, &Point::default());

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

  pub fn get_bbox_scale_value(&self, bbox: &BBox) -> Fxx {
    if self.points.is_empty() {
      return 1.0;
    }

    let bbox_points: [Point; 4] = bbox.into();
    let mid_point: Point = (&self.points).into();

    bbox_points
      .iter()
      .map(|origin| {
        // At this point, we're working with the assumption that the BBox is bigger
        // than the convex hull so we need a vector that goes from the origin outwards.
        let vector = LineSegment::default()
          .with_start(Point::at(0.0, 0.0))
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

        let origin_distance = origin.distance_to(&mid_point);
        let intersection_point_distance = intersection_point.distance_to(&mid_point);

        origin_distance / intersection_point_distance
      })
      .max_by(|a, b| OrderedFloat(*a).cmp(&OrderedFloat(*b)))
      .expect("There should be at least one point")
  }

  pub fn scale(&self, scale: Fxx) -> Self {
    ConvexHull {
      points: self.points.iter().map(|point| point.scale(scale)).collect(),
    }
  }

  pub fn rotate(&self, theta: Fxx, origin: Option<&Point>) -> Self {
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
  (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x) > 0.0
}

/// Returns true if a <= b <= c. This assumes that
/// we're always working with normalized radians (0.0 to 2PI)
/// and that a and c are clockwise.
///
/// It handles cases where a <= PI * 2.0 and c >= 0.0, in other
/// words where the range wraps around 0.0.
fn is_between_radians(a: Fxx, b: Fxx, c: Fxx) -> bool {
  // If a and c are colinear, then b must also be colinear to
  // a and c to be between them.
  if a == c {
    return a == b;
  }

  // The normal check c does not wrap around 0.0
  if a < c {
    return a <= b && b <= c;
  }

  // At this point, c wraps around 0.0
  // We need to check if b is between a and 2PI
  // or between 0.0 and c
  a <= b || b <= c
}
