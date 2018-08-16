export default (px, py, cx, cy, radius, padding = 0) =>
  ((px - cx) ** 2) + ((py - cy) ** 2) < ((radius + padding) ** 2);

