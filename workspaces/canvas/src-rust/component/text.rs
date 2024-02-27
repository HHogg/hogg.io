use geometry::BBox;

use super::{Component, Draw, Style};
use crate::canvas::Scale;
use crate::collision::Theia;
use crate::Error;

#[derive(Clone)]
pub struct Text {
  pub text: String,
  pub point: geometry::Point,
  pub style: Style,
}

impl Draw for Text {
  fn component(&self) -> Component {
    self.clone().into()
  }

  fn style(&self) -> &Style {
    &self.style
  }

  fn bbox(
    &self,
    context: &web_sys::CanvasRenderingContext2d,
    _canvas_bbox: &BBox,
    _content_bbox: &BBox,
    scale: &Scale,
  ) -> Result<BBox, Error> {
    self.style.apply(context, scale)?;
    let text_metrics = context.measure_text(&self.text)?;

    let left = self.point.x - text_metrics.actual_bounding_box_left();
    let right = self.point.x + text_metrics.actual_bounding_box_right();
    let top = self.point.y - text_metrics.actual_bounding_box_ascent();
    let bottom = self.point.y + text_metrics.actual_bounding_box_descent();

    Ok(
      BBox::default()
        .with_min(geometry::Point::default().with_xy(left, top))
        .with_max(geometry::Point::default().with_xy(right, bottom)),
    )
  }

  fn draw(
    &self,
    context: &web_sys::CanvasRenderingContext2d,
    _canvas_bbox: &BBox,
    _content_bbox: &BBox,
    scale: &Scale,
    _theia: &mut Theia,
  ) -> Result<(), Error> {
    self.draw_start(context, scale, &self.style)?;

    context.fill_text(&self.text, self.point.x, self.point.y)?;

    self.draw_end(context);

    Ok(())
  }
}
