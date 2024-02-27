mod arc;
mod arrow;
mod chevron;
mod draw;
mod line_segment;
mod line_segment_arrows;
mod point;
mod polygon;

use geometry::BBox;

pub use self::arc::Arc;
pub use self::arrow::Arrow;
pub use self::chevron::Chevron;
pub use self::draw::Draw;
pub use self::line_segment::LineSegment;
pub use self::line_segment_arrows::LineSegmentArrows;
pub use self::point::Point;
pub use self::polygon::Polygon;
use super::collision::Theia;
use crate::error::Error;
use crate::{Scale, Style};

#[derive(Clone)]
pub enum Component {
  Arc(Arc),
  Arrow(Arrow),
  Chevron(Chevron),
  LineSegment(LineSegment),
  LineSegmentArrows(LineSegmentArrows),
  Point(Point),
  Shape(Polygon),
}

impl Component {
  pub fn inner(&self) -> &dyn Draw {
    match self {
      Self::Arc(d) => d,
      Self::Arrow(d) => d,
      Self::Chevron(d) => d,
      Self::LineSegment(d) => d,
      Self::LineSegmentArrows(d) => d,
      Self::Point(d) => d,
      Self::Shape(d) => d,
    }
  }
}

impl Draw for Component {
  fn collides_with(
    &self,
    canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
    other: &Component,
  ) -> bool {
    self
      .inner()
      .collides_with(canvas_bbox, content_bbox, scale, other)
  }

  fn component(&self) -> Component {
    self.clone()
  }

  fn bbox(&self, canvas_bbox: &BBox, content_bbox: &BBox, scale: &Scale) -> BBox {
    self.inner().bbox(canvas_bbox, content_bbox, scale)
  }

  fn draw(
    &self,
    context: &web_sys::CanvasRenderingContext2d,
    canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
    theia: &mut Theia,
  ) -> Result<(), Error> {
    if !theia.has_collision(canvas_bbox, content_bbox, scale, self) {
      self
        .inner()
        .draw(context, canvas_bbox, content_bbox, scale, theia)?;
    }

    Ok(())
  }

  fn draw_bbox(
    &self,
    context: &web_sys::CanvasRenderingContext2d,
    canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
    style: &Style,
  ) -> Result<(), Error> {
    self
      .inner()
      .draw_bbox(context, canvas_bbox, content_bbox, scale, style)
  }
}

impl From<Arc> for Component {
  fn from(arc: Arc) -> Self {
    Self::Arc(arc)
  }
}

impl From<Arrow> for Component {
  fn from(arrow: Arrow) -> Self {
    Self::Arrow(arrow)
  }
}

impl From<Chevron> for Component {
  fn from(chevron: Chevron) -> Self {
    Self::Chevron(chevron)
  }
}

impl From<LineSegment> for Component {
  fn from(line_segment: LineSegment) -> Self {
    Self::LineSegment(line_segment)
  }
}

impl From<LineSegmentArrows> for Component {
  fn from(line_segment_arrows: LineSegmentArrows) -> Self {
    Self::LineSegmentArrows(line_segment_arrows)
  }
}

impl From<Point> for Component {
  fn from(point: Point) -> Self {
    Self::Point(point)
  }
}

impl From<Polygon> for Component {
  fn from(shape: Polygon) -> Self {
    Self::Shape(shape)
  }
}

impl Eq for Component {}

impl PartialEq for Component {
  fn eq(&self, other: &Self) -> bool {
    self.bbox(&BBox::default(), &BBox::default(), &Scale::default())
      == other.bbox(&BBox::default(), &BBox::default(), &Scale::default())
  }
}
