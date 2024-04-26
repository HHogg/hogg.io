use anyhow::Result;
use colorgrad::{CustomGradient, CustomGradientError, Gradient};
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
) -> Result<Gradient, CustomGradientError> {
  CustomGradient::new()
    .html_colors(&colors)
    .domain(&[domain_min as f64, domain_max as f64])
    .mode(colorgrad::BlendMode::Rgb)
    .build()
}

pub fn create_invalid_mode_gradient(
  domain_min: usize,
  domain_max: usize,
) -> Result<Gradient, CustomGradientError> {
  create_custom_gradient(domain_min, domain_max, ["#e64980", "#a61e4d"])
}

pub fn create_valid_mode_gradient(
  domain_min: usize,
  domain_max: usize,
) -> Result<Gradient, CustomGradientError> {
  create_custom_gradient(domain_min, domain_max, ["#12b886", "#087f5b"])
}

pub fn draw_shapes(
  canvas: &mut Canvas<Layer>,
  options: &Options,
  tiling: &Tiling,
) -> Result<(), Error> {
  let path_shape_count = tiling.notation.path.get_shape_count() as f64;
  let color_mode = options.color_mode.clone().unwrap_or_default();
  let shape_style = options.styles.shape.clone().unwrap_or_default();

  if path_shape_count == 0.0 {
    return Ok(());
  }

  let gradient = {
    match color_mode {
      ColorMode::None => None,
      ColorMode::BlackAndWhite => {
        Some(
          CustomGradient::new()
            .html_colors(&["#000000", "#ffffff"])
            .domain(&[0.0, path_shape_count])
            .mode(colorgrad::BlendMode::Rgb)
            .build()?,
        )
      }
      ColorMode::VaporWave => {
        Some(
          CustomGradient::new()
            .html_colors(&VAPOR_WAVE_COLOR_PALETTE)
            .domain(&[0.0, path_shape_count])
            .mode(colorgrad::BlendMode::Rgb)
            .build()?,
        )
      }
      ColorMode::VaporWaveRandom => {
        let mut colors = VAPOR_WAVE_COLOR_PALETTE.to_vec();

        colors.shuffle(&mut thread_rng());

        Some(
          CustomGradient::new()
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

  for shape in tiling.plane.iter() {
    if let Some(max_stage) = options.max_stage {
      if shape.stage_index > max_stage {
        continue;
      }
    }

    canvas.add_component(
      Layer::ShapeFill,
      Polygon {
        polygon: shape.clone(),
        style: options
          .styles
          .shape
          .clone()
          .unwrap_or_default()
          .set_stroke_width(&canvas.scale, None)
          .set_fill(match (&gradient, shape.shape_type) {
            (Some(gradient), Some(shape_type)) => {
              Some(gradient.at(shape_type as f64).to_hex_string())
            }
            _ => shape_style.get_fill(),
          })
          .set_opacity(
            if options.fade_unmatched_shape_types.unwrap_or_default() {
              shape.shape_type.map(|_| 1.0).or(Some(0.2))
            } else {
              None
            },
          ),
      }
      .into(),
    )?;

    canvas.add_component(
      Layer::ShapeBorder,
      Polygon {
        polygon: shape.clone(),
        style: options
          .styles
          .shape
          .clone()
          .unwrap_or_default()
          .set_fill(None),
      }
      .into(),
    )?;
  }

  Ok(())
}
