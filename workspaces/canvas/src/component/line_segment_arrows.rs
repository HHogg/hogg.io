use geometry::BBox;
use web_sys::CanvasRenderingContext2d;

use super::{Arrow, Component, Draw, Style};
use crate::canvas::Scale;
use crate::collision::Theia;
use crate::Error;

const GAP_BETWEEN_ARROWS_MULTIPLIER: f64 = 10.0;
const GAP_FROM_LINE_SEGMENT: f64 = 2.0;
const ARROW_LENGTH: f64 = 2.5;

#[derive(Clone)]
pub struct LineSegmentArrows {
  pub line_segment: geometry::LineSegment,
  pub extend_start: bool,
  pub extend_end: bool,
  pub direction: f64,
  pub style: Style,
}

impl LineSegmentArrows {
  fn get_extended_line_segment(&self, bbox: &BBox) -> geometry::LineSegment {
    self
      .line_segment
      .extend_to_bbox(bbox, self.extend_start, self.extend_end)
  }

  fn get_arrows(&self, _canvas_bbox: &BBox, content_bbox: &BBox, scale: &Scale) -> Vec<Arrow> {
    let chevron_size = self.style.get_chevron_size(scale);
    let line_segment = self.get_extended_line_segment(content_bbox);

    let gap_between_arrows = chevron_size * GAP_BETWEEN_ARROWS_MULTIPLIER;
    let gap_from_line_segment = chevron_size * GAP_FROM_LINE_SEGMENT;
    let length = chevron_size * ARROW_LENGTH;

    let mut shift = 0.0;
    let mut arrows = vec![];

    if gap_between_arrows == 0.0 {
      return arrows;
    }

    while shift < line_segment.length() {
      let p1 = line_segment
        .set_length(line_segment.length() - shift, geometry::Origin::End)
        .p1;

      let p2 = line_segment
        .set_length(
          line_segment.length() - shift - length - gap_from_line_segment,
          geometry::Origin::End,
        )
        .p1;

      let mut arrow_line_segment =
        geometry::LineSegment { p1, p2 }.rotate(self.direction, Some(&p1));

      arrow_line_segment = arrow_line_segment.set_length(
        arrow_line_segment.length() - gap_from_line_segment,
        geometry::Origin::End,
      );

      arrows.push(Arrow {
        line_segment: arrow_line_segment,
        style: self.style.clone(),
      });

      shift += gap_between_arrows;
    }

    arrows
  }
}

impl Draw for LineSegmentArrows {
  fn component(&self) -> Component {
    self.clone().into()
  }

  fn bbox(&self, canvas_bbox: &BBox, content_bbox: &BBox, scale: &Scale) -> BBox {
    let mut bbox = self
      .get_arrows(canvas_bbox, content_bbox, scale)
      .iter()
      .map(|arrow| arrow.bbox(canvas_bbox, content_bbox, scale))
      .reduce(|a, b| a.union(&b))
      .unwrap_or_default();
    bbox = bbox.union(&self.get_extended_line_segment(canvas_bbox).bbox());
    bbox
  }

  fn draw_bbox(
    &self,
    context: &CanvasRenderingContext2d,
    canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
    style: &Style,
  ) -> Result<(), Error> {
    for arrow in self.get_arrows(canvas_bbox, content_bbox, scale).iter() {
      arrow.draw_bbox(context, canvas_bbox, content_bbox, scale, style)?;
    }

    Ok(())
  }

  fn draw(
    &self,
    context: &CanvasRenderingContext2d,
    canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
    theia: &mut Theia,
  ) -> Result<(), Error> {
    for arrow in self.get_arrows(canvas_bbox, content_bbox, scale).iter() {
      arrow.draw(context, canvas_bbox, content_bbox, scale, theia)?;
    }

    Ok(())
  }
}
