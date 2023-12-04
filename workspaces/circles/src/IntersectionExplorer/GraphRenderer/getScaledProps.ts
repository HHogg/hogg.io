const scale = (v: number, m: number) => m * (v / 1);

const getScaledProps = <T extends {}>(
  entities: T[],
  props: (keyof T)[],
  range: number
): T[] => {
  return entities.map((entity) => {
    const entityScaled: T = { ...entity };

    for (const prop of props) {
      entityScaled[prop] = scale(
        entityScaled[prop] as unknown as number,
        range
      ) as any;
    }

    return entityScaled;
  });
};

export default getScaledProps;
