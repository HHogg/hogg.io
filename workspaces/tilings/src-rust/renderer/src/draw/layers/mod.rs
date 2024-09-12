mod draw_axis;
mod draw_grid_line_segment;
mod draw_grid_polygon;
mod draw_plane_outline;
mod draw_shapes;
mod draw_transform;
mod draw_transform_continuous;
mod draw_transform_eccentric;
mod draw_vertex_types;

pub use self::draw_axis::draw_axis;
pub use self::draw_grid_line_segment::draw_grid_line_segment;
pub use self::draw_grid_polygon::draw_grid_polygon;
pub use self::draw_plane_outline::draw_plane_outline;
pub use self::draw_shapes::draw_shapes;
pub use self::draw_transform::draw_transform;
pub use self::draw_transform_continuous::draw_transform_continuous;
pub use self::draw_transform_eccentric::draw_transform_eccentric;
pub use self::draw_vertex_types::draw_vertex_types;

/// The layers of the components in the canvas.
/// This order is used to determine the order in which the components are drawn.
#[derive(Clone, Copy, Debug, Hash, Eq, PartialEq, Ord, PartialOrd)]
pub enum Layer {
  ShapeFill,
  ShapeBorder,
  PlaneOutline,
  GridLineSegment,
  GridPolygon,
  AnnotationLines,
  AnnotationArrows,
  AnnotationPoints,
}
