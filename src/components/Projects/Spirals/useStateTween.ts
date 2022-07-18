import { useMemo, useRef } from 'react';
import { TypeVectorWithSize } from './Spirals';

const lerp = (n0: number, n1: number, t: number) => n0 + (n1 - n0) * t;

export default (
  t: number,
  vectorsA: TypeVectorWithSize[]
): [TypeVectorWithSize[], TypeVectorWithSize[]] => {
  const refVectorsA = useRef(vectorsA);
  const refVectorsB = useRef(vectorsA);

  return useMemo(() => {
    const vectors = vectorsA.map((_, i) =>
      refVectorsA.current[i].map((_, j) =>
        lerp(refVectorsA.current[i][j], refVectorsB.current[i][j], t)
      )
    ) as TypeVectorWithSize[];

    refVectorsA.current = vectors;
    refVectorsB.current = vectorsA;

    return [vectors, vectorsA];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vectorsA]);
};
