import { Circle, Edge, Node } from '../..';

const scale = (v: number, m: number) => m * (v / 1);

const getScaledProps = <T extends Circle | Edge | Node>(
  entities: T[],
  range: number
): T[] => {
  return entities.map((entity) => {
    const entityScaled: T = { ...entity };

    if ('x' in entityScaled) {
      entityScaled.x = scale(entityScaled.x, range);
    }

    if ('y' in entityScaled) {
      entityScaled.y = scale(entityScaled.y, range);
    }

    if ('radius' in entityScaled) {
      entityScaled.radius = scale(entityScaled.radius, range);
    }

    return entityScaled;
  });
};

export default getScaledProps;
