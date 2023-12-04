import atan2 from '../useGraph/atan2';

type CircleEditorCursor =
  | 'default'
  | 'crosshair'
  | 'pointer'
  | 'move'
  | 'ns-resize'
  | 'nesw-resize'
  | 'ew-resize'
  | 'nwse-resize';

export const CURSOR_DEFAULT: CircleEditorCursor = 'default';
export const CURSOR_DRAW: CircleEditorCursor = 'crosshair';
export const CURSOR_FILL: CircleEditorCursor = 'pointer';
export const CURSOR_MOVE: CircleEditorCursor = 'move';

const CURSOR_RESIZE_T_B: CircleEditorCursor = 'ns-resize';
const CURSOR_RESIZE_BL_TR: CircleEditorCursor = 'nesw-resize';
const CURSOR_RESIZE_L_R: CircleEditorCursor = 'ew-resize';
const CURSOR_RESIZE_BR_TL: CircleEditorCursor = 'nwse-resize';

export const getCursor = (px: number, py: number, cx: number, cy: number) => {
  const a = (atan2(px, py, cx, cy) * 180) / Math.PI;

  if (a > 247.5 && a < 292.5) return CURSOR_RESIZE_T_B;
  if (a > 292.5 && a < 337.5) return CURSOR_RESIZE_BL_TR;
  if (a > 337.5 || a < 22.5) return CURSOR_RESIZE_L_R;
  if (a > 22.5 && a < 67.5) return CURSOR_RESIZE_BR_TL;
  if (a > 67.5 && a < 112.5) return CURSOR_RESIZE_T_B;
  if (a > 112.5 && a < 157.5) return CURSOR_RESIZE_BL_TR;
  if (a > 157.5 && a < 202.5) return CURSOR_RESIZE_L_R;
  if (a > 202.5 && a < 247.5) return CURSOR_RESIZE_BR_TL;

  return CURSOR_DRAW;
};

export const setCursor = (
  element: null | HTMLElement | SVGElement,
  cursor: CircleEditorCursor
) => {
  if (element) element.style.cursor = cursor;
};
