mod collision;
mod component;
mod scale;
mod style;

use std::collections::BTreeMap;
use std::hash::Hash;

use anyhow::Result;
use tiling::geometry::BBox;
use wasm_bindgen::JsCast;

use self::collision::Theia;
pub use self::component::{Arc, Grid, LineSegment, LineSegmentArrows, Point, Polygon};
use self::component::{Component, Draw, Rect};
pub use self::scale::{Scale, ScaleMode};
pub use self::style::Style;
use crate::Error;

pub struct Canvas<TLayer> {
  pub scale: Scale,

  context: web_sys::OffscreenCanvasRenderingContext2d,
  content_bbox: BBox,

  show_debug_layer: bool,
  debug_style: Style,

  layers: Option<BTreeMap<TLayer, Vec<Component>>>,
  theia: Theia,
}

impl<TLayer> Canvas<TLayer>
where
  TLayer: Eq + Hash + Ord,
{
  pub fn new(canvas: web_sys::OffscreenCanvas, scale: Scale) -> Result<Self, Error> {
    let context = canvas.get_context("2d");

    if context.is_err() {
      return Err(Error::ApplicationError {
        reason: "Failed to get 2d context (error)".into(),
      });
    }

    let context = context.unwrap();

    if context.is_none() {
      return Err(Error::ApplicationError {
        reason: "Failed to get 2d context (empty)".into(),
      });
    }

    let context = context
      .unwrap()
      .dyn_into::<web_sys::OffscreenCanvasRenderingContext2d>();

    if context.is_err() {
      return Err(Error::ApplicationError {
        reason: "Failed to get 2d context (dyn_into error)".into(),
      });
    }

    let context = context.unwrap();

    let width = canvas.width() as f64;
    let height = canvas.height() as f64;

    let canvas_bbox = BBox::default().with_width(width).with_height(height);

    // Clear canvas ready for drawing
    context.set_transform(1.0, 0.0, 0.0, 1.0, 0.0, 0.0)?;
    context.clear_rect(0.0, 0.0, width, height);

    Ok(Self {
      content_bbox: BBox::default(),
      context,
      scale: scale.with_canvas_bbox(canvas_bbox),

      show_debug_layer: false,
      debug_style: Style::default(),

      layers: None,
      theia: Theia::new(),
    })
  }

  pub fn content_bbox(&self) -> &BBox {
    &self.content_bbox
  }

  pub fn draw_debug(&mut self, style: &Option<Style>) {
    self.show_debug_layer = true;
    self.debug_style = style.clone().unwrap_or_default();
  }

  pub fn add_component(&mut self, layer: TLayer, component: Component) -> Result<(), Error> {
    let layers = self.layers.get_or_insert(BTreeMap::new());
    let layer = layers.entry(layer).or_default();
    let canvas_bbox = &self.scale.scaled_canvas_bbox();

    let component_bbox =
      component.bbox(&self.context, canvas_bbox, &self.content_bbox, &self.scale)?;

    layer.push(component);

    self.content_bbox = self.content_bbox.union(&component_bbox);
    self.rescale_canvas()?;

    Ok(())
  }

  fn rescale_canvas(&mut self) -> Result<(), Error> {
    self.scale = self.scale.to_owned().with_content_bbox(self.content_bbox);
    self.scale.scale_canvas_context(&self.context)?;

    Ok(())
  }

  pub fn render(&mut self) -> Result<(), Error> {
    let layers = self.layers.take().unwrap_or_default();

    if self.show_debug_layer {
      let canvas_bbox = self.scale.scaled_canvas_bbox();

      Rect {
        min: canvas_bbox.min,
        max: canvas_bbox.max,
        style: self.debug_style.clone(),
      }
      .draw_bbox(
        &self.context,
        &canvas_bbox,
        &self.content_bbox,
        &self.scale,
        &self.debug_style,
      )?;
    }

    for (_, layer) in layers.iter() {
      for component in layer.iter() {
        self.render_component(component)?;
      }
    }

    Ok(())
  }

  fn render_component(&mut self, component: &Component) -> Result<(), Error> {
    let canvas_bbox = self.scale.scaled_canvas_bbox();

    self.context.save();

    component.draw(
      &self.context,
      &canvas_bbox,
      &self.content_bbox,
      &self.scale,
      &mut self.theia,
    )?;

    if self.show_debug_layer {
      component.draw_bbox(
        &self.context,
        &canvas_bbox,
        &self.content_bbox,
        &self.scale,
        &self.debug_style,
      )?;
    }

    self.context.restore();

    Ok(())
  }
}
