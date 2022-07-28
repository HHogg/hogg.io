export default (px: number, py: number, cx: number, cy: number, radius: number, padding: number = 0) =>
  ((px - cx) ** 2) + ((py - cy) ** 2) < ((radius + padding) ** 2);

