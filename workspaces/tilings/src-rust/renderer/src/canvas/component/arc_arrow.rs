use hogg_geometry::{BBox, Point};
use hogg_spatial_grid_map::Fxx;

use super::{Arc, Chevron, Draw, Style};
use crate::canvas::Scale;

#[derive(Clone, Debug, Default)]
pub struct ArcArrow {
  point: Point,
  radius: Fxx,
  start_angle: Fxx,
  end_angle: Fxx,
  style: Style,
  interactive: Option<bool>,
}

impl ArcArrow {
  pub fn non_interactive(mut self) -> Self {
    self.interactive = Some(false);
    self
  }

  pub fn with_point(mut self, point: Point) -> Self {
    self.point = point;
    self
  }

  pub fn with_radius(mut self, radius: Fxx) -> Self {
    self.radius = radius;
    self
  }

  pub fn with_start_angle(mut self, start_angle: Fxx) -> Self {
    self.start_angle = start_angle;
    self
  }

  pub fn with_end_angle(mut self, end_angle: Fxx) -> Self {
    self.end_angle = end_angle;
    self
  }

  pub fn with_style(mut self, style: Style) -> Self {
    self.style = style;
    self
  }
}

// https://stackoverflow.com/questions/77798747/how-to-calculate-the-bounding-box-of-an-arc
impl Draw for ArcArrow {
  fn bbox(
    &self,
    context: &web_sys::OffscreenCanvasRenderingContext2d,
    canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
  ) -> BBox {
    let arc = Arc::default()
      .with_point(self.point)
      .with_radius(self.radius)
      .with_start_angle(self.start_angle)
      .with_end_angle(self.end_angle)
      .with_style(self.style.clone());

    let chevron = Chevron::default()
      .with_point(
        self
          .point
          .translate(&Point::at(0.0, -arc.get_radius(scale)))
          .rotate(self.end_angle, Some(&self.point)),
      )
      .with_direction(self.end_angle)
      .with_style(self.style.clone());

    let arc_bbox = arc.bbox(context, canvas_bbox, content_bbox, scale);
    let chevron_bbox = chevron.bbox(context, canvas_bbox, content_bbox, scale);

    arc_bbox.union(&chevron_bbox)
  }

  fn component(&self) -> super::Component {
    self.clone().into()
  }

  fn draw(
    &self,
    context: &web_sys::OffscreenCanvasRenderingContext2d,
    canvas_bbox: &BBox,
    content_bbox: &BBox,
    scale: &Scale,
    theia: &mut crate::canvas::collision::Theia,
  ) -> Result<(), crate::Error> {
    let arc = Arc::default()
      .with_point(self.point)
      .with_radius(self.radius)
      .with_start_angle(self.start_angle)
      .with_end_angle(self.end_angle)
      .with_style(self.style.clone());

    let chevron = Chevron::default()
      .with_point(
        self
          .point
          .translate(&Point::at(0.0, -arc.get_radius(scale)))
          .rotate(self.end_angle, Some(&self.point)),
      )
      .with_direction(self.end_angle)
      .with_style(self.style.clone());

    arc.draw(context, canvas_bbox, content_bbox, scale, theia)?;
    chevron.draw(context, canvas_bbox, content_bbox, scale, theia)?;

    Ok(())
  }

  fn interactive(&self) -> Option<bool> {
    self.interactive
  }

  fn style(&self) -> &Style {
    &self.style
  }
}
