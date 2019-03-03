export const POINT_CENTROID = 'c';
export const POINT_EDGE = 'e';

export const TRANSFORM_MIRROR = 'm';
export const TRANSFORM_ROTATION = 'r';

const DELIMETER_STAGE = '/';
const DELIMETER_PHASE = '-';
const DELIMETER_SHAPE = ',';

const REGEX_TRANSFORM = /([mr])(\d*)?\(?(\d+)?([ce])?\)?/i;

const toRadians = (n) => (n * (Math.PI / 180));

const toTransform = (transform) => {
  const match = REGEX_TRANSFORM.exec(transform);

  if (match) {
    const [,
      action,
      actionAngle = 180,
      pointNumber,
      pointType,
    ] = match;

    return {
      action: action.toLowerCase(),
      actionAngle: toRadians(actionAngle),
      pointNumber: pointNumber && +pointNumber,
      pointType: pointType,
      transform: transform,
    };
  }
};

export default (string) => {
  const [
    shapes,
    ...transforms
  ] = string.split(DELIMETER_STAGE);

  const [
    shapeSeed,
    ...shapeGroups
  ] = shapes
    .split(DELIMETER_PHASE)
    .map((group) =>
      group
        .split(DELIMETER_SHAPE)
        .map((shape) => +shape));

  const transformEntites = transforms
    .map(toTransform)
    .filter(Boolean);

  return [
    +shapeSeed,
    shapeGroups,
    ...transformEntites,
  ];
};
