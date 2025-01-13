use std::f32;
use std::f32::consts::PI;

pub type X1Y1X2Y2 = (f32, f32, f32, f32);

pub fn extend_line_segment(
  line_segment: X1Y1X2Y2,
  bbox: X1Y1X2Y2,
  extend_start: bool,
  extend_end: bool,
) -> X1Y1X2Y2 {
  let (mut x1, mut y1, mut x2, mut y2) = line_segment;
  let (min_x, min_y, max_x, max_y) = bbox;

  let dx = x2 - x1;
  let dy = y2 - y1;
  let is_horizontal = dy.abs() < f32::EPSILON;
  let is_vertical = dx.abs() < f32::EPSILON;

  // For cases where the line is horizontal or vertical,
  // we can just use the min/max values of the bbox, and
  // we can avoid any division by zero errors
  if is_horizontal || is_vertical {
    if is_horizontal {
      if x1 < x2 {
        if extend_start {
          x1 = min_x;
        }

        if extend_end {
          x2 = max_x
        }
      } else {
        if extend_start {
          x1 = max_x;
        }

        if extend_end {
          x2 = min_x
        }
      }
    }

    if is_vertical {
      if y1 < y2 {
        if extend_start {
          y1 = min_y;
        }

        if extend_end {
          y2 = max_y
        }
      } else {
        if extend_start {
          y1 = max_y;
        }

        if extend_end {
          y2 = min_y
        }
      }
    }

    return (x1, y1, x2, y2);
  }

  let m = dy / dx;
  let b = y1 - m * x1;
  let x = |y: f32| (y - b) / m;
  let y = |x: f32| m * x + b;

  let x_for_min_y = x(min_y);
  let x_for_max_y = x(max_y);
  let y_for_min_x = y(min_x);
  let y_for_max_x = y(max_x);

  let intercepts_min_y = x_for_min_y >= min_x && x_for_min_y <= max_x;
  let intercepts_max_y = x_for_max_y >= min_x && x_for_max_y <= max_x;
  let intercepts_min_x = y_for_min_x >= min_y && y_for_min_x <= max_y;
  let intercepts_max_x = y_for_max_x >= min_y && y_for_max_x <= max_y;

  let cx = (x1 + x2) * 0.5;
  let cy = (y1 + y2) * 0.5;

  let atan_p1 = (y1 - cy).atan2(x1 - cx);
  let atan_p2 = (y2 - cy).atan2(x2 - cx);

  if intercepts_min_y {
    if extend_start && atan_p1 < 0.0 {
      x1 = x_for_min_y;
      y1 = min_y;
    } else if extend_end && atan_p2 < 0.0 {
      x2 = x_for_min_y;
      y2 = min_y;
    }
  }

  if intercepts_max_y {
    if extend_start && atan_p1 > 0.0 {
      x1 = x_for_max_y;
      y1 = max_y;
    } else if extend_end && atan_p2 > 0.0 {
      x2 = x_for_max_y;
      y2 = max_y;
    }
  }

  if intercepts_min_x {
    if extend_start && !(PI * -0.5..=PI * 0.5).contains(&atan_p1) {
      x1 = min_x;
      y1 = y_for_min_x;
    } else if extend_end && !(PI * -0.5..=PI * 0.5).contains(&atan_p2) {
      x2 = min_x;
      y2 = y_for_min_x;
    }
  }

  if intercepts_max_x {
    if extend_start && (atan_p1 > PI * -0.5 && atan_p1 < PI * 0.5) {
      x1 = max_x;
      y1 = y_for_max_x;
    } else if extend_end && (atan_p2 > PI * -0.5 && atan_p2 < PI * 0.5) {
      x2 = max_x;
      y2 = y_for_max_x;
    }
  }

  (x1, y1, x2, y2)
}
