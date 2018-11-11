export const toRelativeFromAbsoluteIntersection = (width, height, { arcs, cx, cy, filled, id, radius, x, y }) => arcs ? ({
  arcs: arcs.map(({ a1, a2, convex, cx, cy, direction, radius }) => ({
    a1: a1,
    a2: a2,
    convex: convex,
    cx: (cx / width) - 0.5,
    cy: (cy / height) - 0.5,
    direction: direction,
    radius: radius / width,
  })),
  cx: (cx / width) - 0.5,
  cy: (cy / height) - 0.5,
  filled: filled,
  id: id,
}) : toRelativeFromAbsoluteShape(width, height, { filled, radius, x, y });

export const toRelativeFromAbsoluteShape = (width, height, { filled, id, radius, x, y }) => ({
  filled: filled,
  id: id,
  radius: radius / width,
  x: (x / width) - 0.5,
  y: (y / height) - 0.5,
});
