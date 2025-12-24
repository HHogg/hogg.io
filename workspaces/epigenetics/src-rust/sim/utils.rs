const REGIONAL_ENV_COLOR_PALETTE: [&str; 12] = [
  "#03CAFC", "#06FC9E", "#F569C4", "#B768FC", "#FFFB8D", "#FF06C1", "#8705E4", "#4605EC",
  "#0DFDF9", "#F52E97", "#94157F", "#F9AB53",
];

fn hex_to_rgb(hex: &str) -> (f32, f32, f32) {
  let hex = hex.trim_start_matches('#');
  let r = u8::from_str_radix(&hex[0..2], 16).unwrap();
  let g = u8::from_str_radix(&hex[2..4], 16).unwrap();
  let b = u8::from_str_radix(&hex[4..6], 16).unwrap();
  (r as f32 / 255.0, g as f32 / 255.0, b as f32 / 255.0)
}

fn get_random_color() -> (f32, f32, f32) {
  let random_index = fastrand::usize(0..REGIONAL_ENV_COLOR_PALETTE.len());
  let color = REGIONAL_ENV_COLOR_PALETTE[random_index];
  hex_to_rgb(color)
}

pub fn get_random_colors(count: usize) -> Vec<(f32, f32, f32)> {
  let mut colors = Vec::new();

  while colors.len() < count {
    let color = get_random_color();

    if !colors.contains(&color) {
      colors.push(color);
    }
  }

  colors
}
