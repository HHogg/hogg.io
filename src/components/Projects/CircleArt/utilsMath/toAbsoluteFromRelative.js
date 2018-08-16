export const toAbsoluteFromRelativeIntersection = (mx, my, width, height, { arcs, cx, cy, filled, radius, x, y }) => arcs ? ({
  arcs: arcs.map(({ a1, a2, convex, cx, cy, direction, radius }) => ({
    a1: a1,
    a2: a2,
    convex: convex,
    cx: mx + (cx * width),
    cy: my + (cy * height),
    direction: direction,
    radius: radius * width,
  })),
  cx: mx + (cx * width),
  cy: my + (cy * height),
  filled: filled,
}) : toAbsoluteFromRelativeShape(mx, my, width, height, { x, y, radius });

export const toAbsoluteFromRelativeShape = (mx, my, width, height, { radius, x, y }) => ({
  radius: radius * width,
  x: mx + (x * width),
  y: my + (y * height),
});
