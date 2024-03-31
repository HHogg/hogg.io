import { useSvgLabelsContext } from '@hogg/common';
import { sizeX1Px } from 'preshape';
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
      padding: sizeX1Px,
      geometry: {
        x: width * -0.5,
        y: height * -0.5,
        height,
        width,
      },
    });
  }, [registerObstacle, height, width]);

  return null;
}
