export const POINT_CENTROID = 'c';
export const POINT_EDGE = 'e';

export const TRANSFORM_MIRROR = 'm';
export const TRANSFORM_ROTATION = 'r';

const DEG_90 = Math.PI / 2;

const DELIMETER_STAGE = '/';
const DELIMETER_PHASE = '-';
const DELIMETER_SHAPE = ',';

const REGEX_REPEAT = /\{(\d+),(\d+)\}/;
const REGEX_TRANSFORM = /([mr])(\d*)?\(?(\d+)?([ce])?,?(\d+(?:\.?\d*))?\)?/i;

const toRadians = (n) => n * (Math.PI / 180);

const toRepeat = (transforms, transformEntites) => {
  const match = REGEX_REPEAT.exec(transforms[transforms.length - 1]);

  if (match) {
    const [, start, end] = match;

    return {
      start: +start,
      end: Math.min(+end, transformEntites.length),
    };
  }

  return {
    start: 1,
    end: transformEntites.length,
  };
};

const toTransform = (transform) => {
  const match = REGEX_TRANSFORM.exec(transform);

  if (match) {
    const [,
      action,
      actionAngle = 180,
      pointNumber,
      pointType,
      pointAngle = 180,
    ] = match;

    return {
      action: action.toLowerCase(),
      actionAngle: toRadians(actionAngle),
      pointAngle: toRadians(pointAngle) - DEG_90,
      pointNumber: pointNumber && (pointType === POINT_EDGE
        ? pointNumber - 1
        : +pointNumber),
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

  const hasRepeat = transforms[transforms.length - 1] &&
    REGEX_REPEAT.test(transforms[transforms.length - 1]);

  const transformEntites = transforms
    .slice(0, hasRepeat ? -1 : transforms.length)
    .map(toTransform)
    .filter(Boolean);

  return [
    +shapeSeed,
    shapeGroups,
    toRepeat(transforms, transformEntites),
    ...transformEntites,
  ];
};
