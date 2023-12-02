import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { TypeVectorWithSize } from './getVectors';

const lerp = (n0: number, n1: number, t: number) => n0 + (n1 - n0) * t;

const useStateTween = (
  t: MutableRefObject<number>,
  vectorsA: TypeVectorWithSize[]
): [TypeVectorWithSize[], TypeVectorWithSize[]] => {
  const refVectorsA = useRef(vectorsA);
  const refVectorsB = useRef(vectorsA);
  const [state, setState] = useState<
    [TypeVectorWithSize[], TypeVectorWithSize[]]
  >([vectorsA, vectorsA]);

  useEffect(() => {
    const vectors = vectorsA.map((_, i) =>
      refVectorsA.current[i].map((_, j) =>
        lerp(refVectorsA.current[i][j], refVectorsB.current[i][j], t.current)
      )
    ) as TypeVectorWithSize[];

    refVectorsA.current = vectors;
    refVectorsB.current = vectorsA;

    setState([vectors, vectorsA]);
  }, [t, vectorsA]);

  return state;
};

export default useStateTween;
