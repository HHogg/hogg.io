use tiling::geometry::{BBox, LineSegment, LineSegmentOrigin};

use super::{Arrow, Draw, Style};
use crate::canvas::Scale;

const GAP_BETWEEN_ARROWS_MULTIPLIER: f64 = 10.0;
const GAP_FROM_LINE_SEGMENT: f64 = 2.0;
const ARROW_LENGTH: f64 = 2.5;

#[derive(Clone, Debug, Default)]
pub struct LineSegmentArrows {
  line_segment: LineSegment,
  extend_start: bool,
  extend_end: bool,
  direction: f64,
  style: Style,
}

impl LineSegmentArrows {
  pub fn with_line_segment(mut self, line_segment: LineSegment) -> Self {
    self.line_segment = line_segment;
    self
  }

  pub fn with_extend_start(mut self, extend_start: bool) -> Self {
    self.extend_start = extend_start;
    self
  }

  pub fn with_extend_end(mut self, extend_end: bool) -> Self {
    self.extend_end = extend_end;
    self
  }

  pub fn with_direction(mut self, direction: f64) -> Self {
    self.direction = direction;
    self
  }

  pub fn with_style(mut self, style: Style) -> Self {
    self.style = style;
    self
  }

  fn get_arrows(&self, _canvas_bbox: &BBox, content_bbox: &BBox, scale: &Scale) -> Vec<Arrow> {
    let chevron_size = self.style.get_chevron_size(scale);
    let line_segment =
      self
        .line_segment
        .extend_to_bbox(content_bbox, self.extend_start, self.extend_end);

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
        .set_length(line_segment.length() - shift, LineSegmentOrigin::End)
        .start;

      let p2 = line_segment
        .set_length(
          line_segment.length() - shift - length - gap_from_line_segment,
          LineSegmentOrigin::End,
        )
        .start;

      let mut arrow_line_segment =
        LineSegment { start: p1, end: p2 }.rotate(self.direction, Some(&p1));

      arrow_line_segment = arrow_line_segment.set_length(
        arrow_line_segment.length() - gap_from_line_segment,
        LineSegmentOrigin::End,
      );

      arrows.push(
        Arrow::default()
          .with_line_segment(arrow_line_segment)
          .with_style(self.style.clone()),
      );

      shift += gap_between_arrows;
    }

    arrows
  }
}

impl Draw for LineSegmentArrows {
  fn children(
    &self,
    canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
  ) -> Option<Vec<Box<dyn Draw>>> {
    Some(
      self
        .get_arrows(canvas_bbox, content_bbox, scale)
        .into_iter()
        .map(|arrow| Box::new(arrow) as Box<dyn Draw>)
        .collect::<Vec<_>>(),
    )
  }

  fn component(&self) -> super::Component {
    self.clone().into()
  }

  fn style(&self) -> &Style {
    &self.style
  }
}
