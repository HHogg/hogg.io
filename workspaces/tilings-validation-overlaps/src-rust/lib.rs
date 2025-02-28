use hogg_geometry::LineSegment;
use hogg_spatial_grid_map::{location, SpatialGridMap};

pub fn validate_overlaps(
  line_segments: &SpatialGridMap<LineSegment>,
  line_segment: &LineSegment,
) -> Result<(), String> {
  let location: location::Point = line_segment.mid_point().into();
  let line_segment_count = line_segments.get_counter(&location, "count").unwrap_or(&0);

  // If a line segment has more than 2 polygons touching it
  // then it's overlapping with another line segment
  if *line_segment_count > 2 {
    return Err(format!(
      "line segment count of {} is > 2",
      line_segment_count
    ));
  }

  let nearby_line_segments = line_segments
    .iter_values_around(&location, 1)
    .filter(|other| *other != line_segment);

  // If a line segment intersects with another line segment
  // then it's overlapping with another line segment
  for nearby_line_segment in nearby_line_segments {
    if line_segment.is_intersecting_with_polygon_line_segment(nearby_line_segment) {
      return Err("nearby line segments intersecting".to_string());
    }
  }

  Ok(())
}
