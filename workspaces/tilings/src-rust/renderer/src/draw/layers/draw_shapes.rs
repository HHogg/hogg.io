use std::collections::HashMap;

use anyhow::Result;
use colorgrad::{Gradient, GradientBuilder};
use hogg_tiling_generator::Tiling;
use rand::seq::SliceRandom;
use rand::thread_rng;

use super::Layer;
use crate::canvas::{Canvas, Polygon};
use crate::draw::options::{ColorMode, ColorPalette};
use crate::draw::Options;
use crate::Error;

pub const VAPOR_WAVE_COLOR_PALETTE: [&str; 12] = [
  "#03CAFC", "#06FC9E", "#F569C4", "#B768FC", "#FFFB8D", "#FF06C1", "#8705E4", "#4605EC",
  "#0DFDF9", "#F52E97", "#94157F", "#F9AB53",
];

pub fn draw_shapes(canvas: &mut Canvas, options: &Options, tiling: &Tiling) -> Result<(), Error> {
  let color_mode = options.color_mode.clone().unwrap_or_default();
  let color_palette = options.color_palette.clone().unwrap_or_default();
  let shape_style = options.styles.shape.clone().unwrap_or_default();

  let color_domain = match color_mode {
    ColorMode::Placement => tiling.notation.path.get_shape_count() as f32,
    ColorMode::Stage => tiling.plane.stages.len() as f32,
  };

  if color_domain == 0.0 {
    return Ok(());
  }

  let gradient: Option<colorgrad::LinearGradient> = {
    match color_palette {
      ColorPalette::None => None,
      ColorPalette::BlackAndWhite => Some(
        GradientBuilder::new()
          .html_colors(&["#000000", "#ffffff"])
          .domain(&[0.0, color_domain])
          .mode(colorgrad::BlendMode::Rgb)
          .build()?,
      ),
      ColorPalette::VaporWave => Some(
        GradientBuilder::new()
          .html_colors(&VAPOR_WAVE_COLOR_PALETTE)
          .domain(&[0.0, color_domain])
          .mode(colorgrad::BlendMode::Rgb)
          .build()?,
      ),
      ColorPalette::VaporWaveRandom => {
        let mut colors = VAPOR_WAVE_COLOR_PALETTE.to_vec();

        colors.shuffle(&mut thread_rng());

        Some(
          GradientBuilder::new()
            .html_colors(&colors)
            .domain(&[0.0, color_domain])
            .mode(colorgrad::BlendMode::Rgb)
            .build()?,
        )
      }
    }
  };

  // Match up polygons during the placement stage (by their notation index)
  // to the index of their shape type in the sequence store. This allows
  // us to color the polygons by their shape type.
  let shape_types = tiling.plane.get_shape_types();
  let shape_types_by_index = tiling
    .plane
    .iter_placement_tiles()
    .map(|tile| {
      (
        tile.index,
        shape_types.get_index(
          &tiling
            .plane
            .point_sequences
            .get_primary_center_point_sequence(&tile.geometry.centroid)
            .expect("Expected to find a sequence for point center")
            .sequence,
        ),
      )
    })
    .filter_map(|(notation_index, shape_type)| {
      shape_type.map(|shape_type| (notation_index, shape_type))
    })
    .collect::<HashMap<u16, u8>>();

  for tile in tiling.plane.iter_tiles() {
    if let Some(max_stage) = options.max_stage {
      if tile.stage_index > max_stage {
        continue;
      }
    }

    let color_index = match color_mode {
      ColorMode::Placement => *shape_types_by_index.get(&tile.index).unwrap_or(&0) as f32,
      ColorMode::Stage => tile.stage_index as f32,
    };

    let fill = gradient
      .as_ref()
      .map(|gradient| gradient.at(color_index).to_hex_string())
      .or_else(|| Some(shape_style.get_fill()));

    canvas.add_component(
      Layer::ShapeFill,
      Polygon::default()
        .non_interactive()
        .with_polygon(tile.geometry.clone())
        .with_style(
          options
            .styles
            .shape
            .clone()
            .unwrap_or_default()
            .set_stroke_width(&canvas.scale, None)
            .set_fill(fill),
        )
        .into(),
    )?;

    canvas.add_component(
      Layer::ShapeBorder,
      Polygon::default()
        .non_interactive()
        .with_polygon(tile.geometry.clone())
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
