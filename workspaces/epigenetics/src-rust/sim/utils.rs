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

pub fn get_colors(count: usize) -> Vec<(f32, f32, f32)> {
  return REGIONAL_ENV_COLOR_PALETTE
    .iter()
    .take(count)
    .map(|color| hex_to_rgb(color))
    .collect();
}
