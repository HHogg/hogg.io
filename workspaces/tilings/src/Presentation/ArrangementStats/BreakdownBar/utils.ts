type CreateRectPathProps = {
  width: number;
  height: number;
  topLeftRadius: number;
  topRightRadius: number;
  bottomRightRadius: number;
  bottomLeftRadius: number;
};

export function createRectPath({
  width,
  height,
  topLeftRadius,
  topRightRadius,
  bottomRightRadius,
  bottomLeftRadius,
}: CreateRectPathProps) {
  function a(r: number, x: number, y: number) {
    return r > 0 ? `A ${r} ${r} 0 0 1 ${x} ${y}` : null;
  }

  return [
    `M ${topLeftRadius} 0`,
    // Draw a horizontal line to the top right corner, considering top right radius
    `H ${width - topRightRadius}`,
    // Draw an arc for top right corner if radius is greater than 0
    a(topRightRadius, width, topRightRadius),
    // Draw a vertical line to the bottom right corner, considering bottom right radius
    `V ${height - bottomRightRadius}`,
    // Draw an arc for bottom right corner if radius is greater than 0
    a(bottomRightRadius, width - bottomRightRadius, height),
    // Draw a horizontal line to the bottom left corner, considering bottom left radius
    `H ${bottomLeftRadius}`,
    // Draw an arc for bottom left corner if radius is greater than 0
    a(bottomLeftRadius, 0, height - bottomLeftRadius),
    // Draw a vertical line to the top left corner, considering top left radius
    `V ${topLeftRadius}`,
    // Draw an arc for top left corner if radius is greater than 0
    a(topLeftRadius, topLeftRadius, 0),
    // Close the path
    'Z',
  ]
    .filter((v) => v != null)
    .join(' ');
}
