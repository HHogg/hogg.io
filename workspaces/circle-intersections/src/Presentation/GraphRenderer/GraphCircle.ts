import { useSvgLabelsContext } from '@hogg/common';
import { sizeX2Px } from 'preshape';
import { useEffect } from 'react';
import { Circle } from '../../useGraph';

type Props = {
  circle: Circle;
};

export default function GraphCircle({ circle }: Props) {
  const { registerObstacle } = useSvgLabelsContext();

  useEffect(() => {
    return registerObstacle({
      id: circle.id,
      geometry: circle,
      padding: sizeX2Px,
      type: 'outline',
    });
  }, [circle, registerObstacle]);

  return null;
}
