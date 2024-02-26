import { useSvgLabelsContext } from '@hogg/common';
import { sizeX2Px } from 'preshape';
import { useEffect } from 'react';

type Props = {
  height: number;
  width: number;
};

export default function GraphBounds({ height, width }: Props) {
  const { registerObstacle } = useSvgLabelsContext();

  useEffect(() => {
    return registerObstacle({
      id: 'bounds',
      type: 'bounds',
      padding: sizeX2Px,
      geometry: {
        x: 0,
        y: 0,
        height,
        width,
      },
    });
  }, [registerObstacle, height, width]);

  return null;
}
