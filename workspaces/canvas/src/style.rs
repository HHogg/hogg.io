use serde::{Deserialize, Serialize};
use typeshare::typeshare;
use wasm_bindgen::JsValue;
use web_sys::CanvasRenderingContext2d;

use crate::Scale;

#[derive(Clone, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[typeshare]
pub struct Style {
  chevron_size: Option<f64>,
  fill: Option<String>,
  line_dash: Option<Vec<f64>>,
  line_thickness: Option<f64>,
  point_radius: Option<f64>,
  stroke_color: Option<String>,
  stroke_width: Option<f64>,
  opacity: Option<f64>,
}

impl Style {
  pub fn get_chevron_size(&self, scale: &Scale) -> f64 {
    self
      .chevron_size
      .map(|v| scale.scale_value_to_content(v))
      .unwrap_or(0.0)
  }

  pub fn get_fill(&self) -> Option<String> {
    self.fill.clone()
  }

  pub fn get_line_dash(&self, scale: &Scale) -> Option<Vec<f64>> {
    self.line_dash.as_ref().map(|v| {
      v.iter()
        .copied()
        .map(|v| scale.scale_value_to_content(v))
        .collect()
    })
  }

  pub fn get_line_thickness(&self, scale: &Scale) -> f64 {
    self
      .line_thickness
      .map(|v| scale.scale_value_to_content(v))
      .unwrap_or(0.0)
  }

  pub fn get_point_radius(&self, scale: &Scale) -> f64 {
    self
      .point_radius
      .map(|v| scale.scale_value_to_content(v))
      .unwrap_or(0.0)
  }

  pub fn get_stroke_color(&self) -> String {
    let default_stroke_color = "transparent".to_string();
    self.stroke_color.clone().unwrap_or(default_stroke_color)
  }

  pub fn get_stroke_width(&self, scale: &Scale) -> f64 {
    self
      .stroke_width
      .map(|v| scale.scale_value_to_content(v))
      .unwrap_or(0.0)
  }

  pub fn set_fill(&self, fill: Option<String>) -> Self {
    let mut style = self.clone();
    style.fill = fill;
    style
  }

  pub fn set_line_dash(&self, scale: &Scale, line_dash: Option<Vec<f64>>) -> Self {
    let mut style = self.clone();
    style.line_dash = line_dash.map(|v| {
      v.into_iter()
        .map(|v| scale.scale_value_to_content(v))
        .collect()
    });
    style
  }

  pub fn set_opacity(&self, opacity: Option<f64>) -> Self {
    let mut style = self.clone();
    style.opacity = opacity;
    style
  }

  pub fn set_point_radius(&self, scale: &Scale, point_radius: Option<f64>) -> Self {
    let mut style = self.clone();
    style.point_radius = point_radius.map(|v| scale.scale_value_to_canvas(v));
    style
  }

  pub fn set_stroke_color(&self, stroke_color: Option<String>) -> Self {
    let mut style = self.clone();
    style.stroke_color = stroke_color;
    style
  }

  pub fn set_stroke_width(&self, scale: &Scale, stroke_width: Option<f64>) -> Self {
    let mut style = self.clone();
    style.stroke_width = stroke_width.map(|v| scale.scale_value_to_canvas(v));
    style
  }

  pub fn apply(&self, context: &CanvasRenderingContext2d, scale: &Scale) -> Result<(), JsValue> {
    context.set_line_join("round");
    context.set_line_cap("round");
    self.apply_opacity(context);
    self.apply_line_dash(context, scale)?;
    self.apply_fill(context);
    self.apply_stroke(context, scale);

    Ok(())
  }

  fn apply_fill(&self, context: &CanvasRenderingContext2d) {
    let default_fill_style = "transparent".to_string();
    let fill_style = self.fill.as_ref().unwrap_or(&default_fill_style);

    context.set_fill_style(&fill_style.into());
  }

  fn apply_opacity(&self, context: &CanvasRenderingContext2d) {
    let opacity = self.opacity.unwrap_or(1.0);
    context.set_global_alpha(opacity);
  }

  fn apply_stroke(&self, context: &CanvasRenderingContext2d, scale: &Scale) {
    let stroke_color = self.get_stroke_color();
    let stroke_width = self.get_stroke_width(scale);

    if stroke_width > 0.0 {
      context.set_stroke_style(&stroke_color.into());
      context.set_line_width(stroke_width);
    } else {
      context.set_stroke_style(&"transparent".into());
      context.set_line_width(0.0);
    }
  }

  fn apply_line_dash(
    &self,
    context: &CanvasRenderingContext2d,
    scale: &Scale,
  ) -> Result<(), JsValue> {
    if let Some(line_dash) = &self.get_line_dash(scale) {
      context.set_line_dash_offset(0.0);
      context.set_line_dash(&serde_wasm_bindgen::to_value::<Option<Vec<f64>>>(&Some(
        line_dash.clone(),
      ))?)?;
    } else {
      context.set_line_dash_offset(0.0);
      context.set_line_dash(&serde_wasm_bindgen::to_value::<Vec<f64>>(&vec![])?)?;
    }

    Ok(())
  }
}
