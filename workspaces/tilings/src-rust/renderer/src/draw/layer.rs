#[derive(Clone, Copy, Debug, Hash, Eq, PartialEq, Ord, PartialOrd)]
pub enum Layer {
  ShapeFill,
  ShapeBorder,
  AnnotationLines,
  AnnotationArrows,
}
