mod draw_axis;
mod draw_shapes;
mod draw_transform;
mod draw_transform_continuous;
mod draw_transform_eccentric;
mod draw_vertex_types;

pub use self::draw_axis::draw_axis;
pub use self::draw_shapes::draw_shapes;
pub use self::draw_transform::draw_transform;
pub use self::draw_transform_continuous::draw_transform_continuous;
pub use self::draw_transform_eccentric::draw_transform_eccentric;
pub use self::draw_vertex_types::draw_vertex_types;

#[derive(Clone, Copy, Debug, Hash, Eq, PartialEq, Ord, PartialOrd)]
pub enum Layer {
  ShapeFill,
  ShapeBorder,
  AnnotationLines,
  AnnotationArrows,
  AnnotationPoints,
}
