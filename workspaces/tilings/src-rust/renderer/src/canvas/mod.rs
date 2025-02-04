mod collision;
mod component;
mod scale;
mod style;

use std::collections::{BTreeMap, HashMap, VecDeque};

use anyhow::Result;
use hogg_geometry::BBox;
use hogg_tiling::Tiling;
use wasm_bindgen::JsCast;

use self::collision::Theia;
pub use self::component::{ArcArrow, Grid, LineSegment, LineSegmentArrows, Point, Polygon};
use self::component::{Component, Draw};
pub use self::scale::{Scale, ScaleMode};
pub use self::style::Style;
use crate::draw::Layer;
use crate::{Error, Options};

pub struct Canvas {
  pub scale: Scale,

  context: web_sys::OffscreenCanvasRenderingContext2d,
  content_bbox: BBox,

  draw_bounding_boxes: bool,
  draw_bounding_boxes_style: Style,

  layers: Option<BTreeMap<Layer, Vec<Component>>>,
  layers_enabled: HashMap<Layer, bool>,

  theia: Theia,
}

impl Canvas {
  pub fn new(
    canvas: &web_sys::OffscreenCanvas,
    options: &Options,
    tiling: &Tiling,
  ) -> Result<Self, Error> {
    let context = canvas
      .get_context("2d")
      .expect("Failed to get 2d context")
      .expect("Context does not exist")
      .dyn_into::<web_sys::OffscreenCanvasRenderingContext2d>()
      .expect("Failed to convert to 2d context");

    let scale = Scale::default()
      .with_auto_rotate(options.auto_rotate)
      .with_padding(options.padding)
      .with_mode(options.scale_mode)
      .with_has_error(tiling.result.error.is_some())
      .with_has_transforms(tiling.notation.transforms.len() >= 2);

    let layers_enabled = options.show_layers.clone().unwrap_or_default();
    let width = canvas.width() as f32;
    let height = canvas.height() as f32;

    let canvas_bbox = BBox::default().with_width(width).with_height(height);

    // Clear canvas ready for drawing
    context.set_transform(1.0, 0.0, 0.0, 1.0, 0.0, 0.0)?;
    context.clear_rect(0.0, 0.0, width as f64, height as f64);

    Ok(Self {
      content_bbox: BBox::default(),
      context,
      scale: scale
        .with_canvas_bbox(canvas_bbox)
        .with_convex_hull(tiling.plane.get_convex_hull()),

      draw_bounding_boxes: layers_enabled
        .get(&Layer::BoundingBoxes)
        .cloned()
        .unwrap_or(false),
      draw_bounding_boxes_style: options.styles.bounding_boxes.clone().unwrap_or_default(),

      layers: None,
      layers_enabled,
      theia: Theia::new(),
    })
  }

  pub fn content_bbox(&self) -> &BBox {
    &self.content_bbox
  }

  pub fn add_component(&mut self, layer: Layer, component: Component) -> Result<(), Error> {
    let layers = self.layers.get_or_insert(BTreeMap::new());
    let layer_components = layers.entry(layer).or_default();
    let canvas_bbox = &self.scale.scaled_canvas_bbox();

    let mut parents: VecDeque<Component> = VecDeque::new();

    parents.push_front(component);

    // Loop over the components, looking for the lowest children
    // and adding them to the layer.
    while let Some(parent) = parents.pop_front() {
      if let Some(children) = parent.children(canvas_bbox, &self.content_bbox, &self.scale) {
        parents.extend(children.iter().map(|c| c.component()));
      } else {
        layer_components.push(parent.component());

        self.content_bbox = self.content_bbox.union(&parent.bbox(
          &self.context,
          canvas_bbox,
          &self.content_bbox,
          &self.scale,
        ));
      }
    }

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

    for (layer, layer_components) in layers.iter() {
      if self.layers_enabled.get(layer) != Some(&true) {
        continue;
      }

      for component in layer_components.iter() {
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

    if self.draw_bounding_boxes {
      component.draw_bbox(
        &self.context,
        &canvas_bbox,
        &self.content_bbox,
        &self.scale,
        &self.draw_bounding_boxes_style,
      )?;
    }

    self.context.restore();

    Ok(())
  }
}
