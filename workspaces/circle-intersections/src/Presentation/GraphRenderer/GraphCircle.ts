import { useSvgLabelsContext } from '@hogg/common';
import { sizeX1Px } from 'preshape';
import { useEffect } from 'react';
import { Circle } from '../../useGraph';

type Props = {
  circle: Circle;
};

export default function GraphCircle({ circle }: Props) {
  const { registerObstacle } = useSvgLabelsContext();

  useEffect(() => {
    return registerObstacle({
      id: `circle-${circle.id}`,
      type: 'outline',
      padding: sizeX1Px,
      geometry: circle,
    });
  }, [circle, registerObstacle]);

  return null;
}
