use hogg_geometry::LineSegment;
use hogg_spatial_grid_map::SpatialGridMap;

/// Checks if the line segments form a single circuit, returning
/// true if they do and false otherwise.
///
/// A single circuit is when all the line segments are connected
/// to each other and form a single loop.
pub fn validate_gaps(mut line_segments: SpatialGridMap<LineSegment>) -> bool {
  // Keep a counter of all the distinct line segments we've seen
  // so at the end we can check if we've seen all the line segments
  let mut visited_count = 0;

  // We'll start with whatever the first line segment is
  let first = line_segments.first().cloned();
  let mut current_wrapper = first;

  // We'll keep looping until there's no more line segments to visit
  while let Some(current) = current_wrapper {
    // We need to keep track of the line segments we've seen,
    // this prevents us from traversing back up the same line
    line_segments.visit(&current.mid_point().into());
    visited_count += 1;

    // It's assumed that the provided SpatialGridMap has the correct
    // grid spacing to account for the line segments' lengths, so iterating
    // with a radius of 1 should be enough to find the connected line segments.
    let neighbors = line_segments.iter_values_around(&current.mid_point().into(), 1);

    // Let's reset current_wrapper to None so that we make sure
    // that we do move to a new line segment if we don't find any
    // neighbors.
    current_wrapper = None;

    // For each of the neighbor line segments, check if it's connected
    // and we haven't seen it before, if so then we'll move to that line segment
    for neighbor in neighbors {
      if current.is_connected_to(neighbor)
        && !line_segments.has_visited(&neighbor.mid_point().into())
      {
        current_wrapper = Some(*neighbor);
        break;
      }
    }

    // If we've reached the end of the loop and we're back at the start
    // then we've found a single circuit.
    if let Some(current) = current_wrapper {
      if current.is_connected_to(&first.unwrap()) {
        // Check if we've seen all the line segments
        return visited_count + 1 == line_segments.size();
      }
    } else {
      current_wrapper = None;
    }
  }

  // If we've reached this point then we haven't found a single circuit
  false
}
