mod arc;
mod arc_arrow;
mod arrow;
mod chevron;
mod draw;
mod grid;
mod line_segment;
mod line_segment_arrows;
mod point;
mod polygon;

use hogg_geometry::BBox;

pub use self::arc::Arc;
pub use self::arc_arrow::ArcArrow;
pub use self::arrow::Arrow;
pub use self::chevron::Chevron;
pub use self::draw::Draw;
pub use self::grid::Grid;
pub use self::line_segment::LineSegment;
pub use self::line_segment_arrows::LineSegmentArrows;
pub use self::point::Point;
pub use self::polygon::Polygon;
use super::collision::Theia;
use super::Scale;
pub use super::Style;
use crate::Error;

#[derive(Clone, Debug)]
pub enum Component {
  Arc(Arc),
  ArcArrow(ArcArrow),
  Arrow(Arrow),
  Chevron(Chevron),
  Grid(Grid),
  LineSegment(LineSegment),
  LineSegmentArrows(LineSegmentArrows),
  Point(Point),
  Polygon(Polygon),
}

impl Component {
  pub fn inner(&self) -> &dyn Draw {
    match self {
      Self::Arc(d) => d,
      Self::ArcArrow(d) => d,
      Self::Arrow(d) => d,
      Self::Chevron(d) => d,
      Self::Grid(d) => d,
      Self::LineSegment(d) => d,
      Self::LineSegmentArrows(d) => d,
      Self::Point(d) => d,
      Self::Polygon(d) => d,
    }
  }
}

impl Draw for Component {
  fn children(
    &self,
    canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
  ) -> Option<Vec<Box<dyn Draw>>> {
    self.inner().children(canvas_bbox, content_bbox, scale)
  }

  fn component(&self) -> Component {
    self.clone()
  }

  fn style(&self) -> &Style {
    self.inner().style()
  }

  fn bbox(
    &self,
    context: &web_sys::OffscreenCanvasRenderingContext2d,
    canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
  ) -> BBox {
    self.inner().bbox(context, canvas_bbox, content_bbox, scale)
  }

  fn draw(
    &self,
    context: &web_sys::OffscreenCanvasRenderingContext2d,
    canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
    theia: &mut Theia,
  ) -> Result<(), Error> {
    if !theia.has_collision(context, canvas_bbox, content_bbox, scale, self) {
      self
        .inner()
        .draw(context, canvas_bbox, content_bbox, scale, theia)?;
    }

    Ok(())
  }

  fn draw_bbox(
    &self,
    context: &web_sys::OffscreenCanvasRenderingContext2d,
    canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
    style: &Style,
  ) -> Result<(), Error> {
    self
      .inner()
      .draw_bbox(context, canvas_bbox, content_bbox, scale, style)
  }

  fn interactive(&self) -> Option<bool> {
    self.inner().interactive()
  }
}

impl Default for Component {
  fn default() -> Self {
    Self::Polygon(Polygon::default())
  }
}

impl From<Arc> for Component {
  fn from(arc: Arc) -> Self {
    Self::Arc(arc)
  }
}

impl From<ArcArrow> for Component {
  fn from(arc_arrow: ArcArrow) -> Self {
    Self::ArcArrow(arc_arrow)
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

impl From<Grid> for Component {
  fn from(value: Grid) -> Self {
    Self::Grid(value)
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
    Self::Polygon(shape)
  }
}
