use std::collections::HashMap;

use anyhow::Result;
use colorgrad::{Gradient, GradientBuilder, GradientBuilderError};
use rand::seq::SliceRandom;
use rand::thread_rng;
use tiling::{Tiling, TilingError};

use super::Layer;
use crate::canvas::{Canvas, Polygon};
use crate::draw::options::ColorMode;
use crate::draw::Options;
use crate::Error;

pub const VAPOR_WAVE_COLOR_PALETTE: [&str; 12] = [
  "#03CAFC", "#06FC9E", "#F569C4", "#B768FC", "#FFFB8D", "#FF06C1", "#8705E4", "#4605EC",
  "#0DFDF9", "#F52E97", "#94157F", "#F9AB53",
];

pub fn create_custom_gradient(
  domain_min: usize,
  domain_max: usize,
  colors: [&str; 2],
) -> Result<colorgrad::LinearGradient, GradientBuilderError> {
  GradientBuilder::new()
    .html_colors(&colors)
    .domain(&[domain_min as f32, domain_max as f32])
    .mode(colorgrad::BlendMode::Rgb)
    .build::<colorgrad::LinearGradient>()
}

pub fn create_invalid_mode_gradient(
  domain_min: usize,
  domain_max: usize,
) -> Result<colorgrad::LinearGradient, GradientBuilderError> {
  create_custom_gradient(domain_min, domain_max, ["#e64980", "#a61e4d"])
}

pub fn create_valid_mode_gradient(
  domain_min: usize,
  domain_max: usize,
) -> Result<colorgrad::LinearGradient, GradientBuilderError> {
  create_custom_gradient(domain_min, domain_max, ["#12b886", "#087f5b"])
}

pub fn draw_shapes(canvas: &mut Canvas, options: &Options, tiling: &Tiling) -> Result<(), Error> {
  let path_shape_count = tiling.notation.path.get_shape_count() as f32;
  let color_mode = options.color_mode.clone().unwrap_or_default();
  let shape_style = options.styles.shape.clone().unwrap_or_default();

  if path_shape_count == 0.0 {
    return Ok(());
  }

  let gradient = {
    match color_mode {
      ColorMode::None => None,
      ColorMode::BlackAndWhite => Some(
        GradientBuilder::new()
          .html_colors(&["#000000", "#ffffff"])
          .domain(&[0.0, path_shape_count])
          .mode(colorgrad::BlendMode::Rgb)
          .build()?,
      ),
      ColorMode::VaporWave => Some(
        GradientBuilder::new()
          .html_colors(&VAPOR_WAVE_COLOR_PALETTE)
          .domain(&[0.0, path_shape_count])
          .mode(colorgrad::BlendMode::Rgb)
          .build()?,
      ),
      ColorMode::VaporWaveRandom => {
        let mut colors = VAPOR_WAVE_COLOR_PALETTE.to_vec();

        colors.shuffle(&mut thread_rng());

        Some(
          GradientBuilder::new()
            .html_colors(&colors)
            .domain(&[0.0, path_shape_count])
            .mode(colorgrad::BlendMode::Rgb)
            .build()?,
        )
      }
      ColorMode::Validity => {
        if let Some(is_valid) = options.is_valid {
          if is_valid {
            Some(create_valid_mode_gradient(0, path_shape_count as usize)?)
          } else {
            Some(create_invalid_mode_gradient(0, path_shape_count as usize)?)
          }
        } else if !matches!(tiling.error, TilingError::Noop) {
          Some(create_invalid_mode_gradient(0, path_shape_count as usize)?)
        } else {
          Some(create_valid_mode_gradient(0, path_shape_count as usize)?)
        }
      }
    }
  };

  // Match up polygons during the placement stage (by their notation index)
  // to the index of their shape type in the sequence store. This allows
  // us to color the polygons by their shape type.
  let shape_types = tiling.plane.get_shape_types();
  let shape_types_by_index = tiling
    .plane
    .iter_polygons_placement()
    .map(|polygon| {
      (
        polygon.index,
        shape_types.get_index(
          &tiling
            .plane
            .points_center
            .get_value(&polygon.centroid.into())
            .expect("Expected to find a sequence for point center")
            .sequence,
        ),
      )
    })
    .filter_map(|(notation_index, shape_type)| {
      shape_type.map(|shape_type| (notation_index, shape_type))
    })
    .collect::<HashMap<u16, u8>>();

  for shape in tiling.plane.iter_polygons() {
    if let Some(max_stage) = options.max_stage {
      if shape.stage_index > max_stage {
        continue;
      }
    }

    canvas.add_component(
      Layer::ShapeFill,
      Polygon::default()
        .non_interactive()
        .with_polygon(shape.clone())
        .with_style(
          options
            .styles
            .shape
            .clone()
            .unwrap_or_default()
            .set_stroke_width(&canvas.scale, None)
            .set_fill(match (&gradient, shape_types_by_index.get(&shape.index)) {
              (Some(gradient), Some(shape_type)) => {
                Some(gradient.at(*shape_type as f32).to_hex_string())
              }
              _ => Some(shape_style.get_fill()),
            }),
        )
        .into(),
    )?;

    canvas.add_component(
      Layer::ShapeBorder,
      Polygon::default()
        .non_interactive()
        .with_polygon(shape.clone())
        .with_style(
          options
            .styles
            .shape
            .clone()
            .unwrap_or_default()
            .set_fill(None),
        )
        .into(),
    )?;
  }

  Ok(())
}
