mod layers;

use std::f64;
use std::f64::consts::PI;

use canvas::{Arc, Canvas, Error, Scale, ScaleMode, Style, Text};
use serde::{Deserialize, Serialize};
use typeshare::typeshare;

use crate::{get_length, Sequence};

#[derive(Clone, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Options {
  pub auto_rotate: Option<bool>,
  pub padding: Option<f64>,
  pub scale_mode: Option<ScaleMode>,
  pub scale_size: Option<u8>,
  pub show_debug: Option<bool>,
  pub styles: Styles,
}

#[derive(Clone, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Styles {
  pub arc: Option<Style>,
  pub debug: Option<Style>,
  pub text: Option<Style>,
}

#[derive(Clone, Copy, Debug, Hash, Eq, PartialEq, Ord, PartialOrd)]
pub enum Layer {
  Arcs,
  Text,
}

pub fn draw(canvas_id: &str, sequence: Sequence, options: Options) -> Result<(), Error> {
  let scale = Scale::default()
    .with_auto_rotate(options.auto_rotate)
    .with_padding(options.padding)
    .with_mode(options.scale_mode);

  let mut canvas = Canvas::<Layer>::new(canvas_id, scale)?;

  let show_debug = options.show_debug.unwrap_or(false);

  if show_debug {
    canvas.draw_debug(&options.styles.debug);
  }

  let sequence_length = get_length(&sequence);
  let arc_padding = PI * 0.05;
  let arc_radius = canvas.scale.radius();

  for i in 0..sequence_length {
    let start_angle = ((i as f64 * 2.0 * PI) / sequence_length as f64) + arc_padding;
    let end_angle = (((i + 1) as f64 * 2.0 * PI) / sequence_length as f64) - arc_padding;

    canvas.add_component(
      Layer::Arcs,
      Arc {
        point: geometry::Point::default(),
        radius: arc_radius,
        start_angle,
        end_angle,
        style: options.styles.arc.clone().unwrap_or_default(),
      }
      .into(),
    )?;

    let center_angle = start_angle - PI * 0.5 - arc_padding;

    let line_thickness = options
      .styles
      .arc
      .as_ref()
      .map(|s| s.get_line_thickness(&canvas.scale))
      .unwrap_or_default();

    let stroke_width = options
      .styles
      .arc
      .as_ref()
      .map(|s| s.get_stroke_width(&canvas.scale))
      .unwrap_or_default();

    let text_point = geometry::Point::default()
      .with_x((arc_radius - line_thickness - stroke_width) * center_angle.cos())
      .with_y((arc_radius - line_thickness - stroke_width) * center_angle.sin());

    canvas.add_component(
      Layer::Text,
      Text {
        text: sequence[i].to_string(),
        point: text_point,
        style: options.styles.text.clone().unwrap_or_default(),
      }
      .into(),
    )?;
  }

  canvas.render()?;

  Ok(())
}
