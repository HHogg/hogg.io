import { SvgLabel, extendPointFromOrigin } from '@hogg/common';
import { sizeX6Px } from 'preshape';
import { PropsWithChildren } from 'react';

type Props = {
  isVisible: boolean;
  text: string;
  x: number;
  y: number;
  oppositeX: number;
  oppositeY: number;
};

const GraphLabel = ({
  isVisible,
  text,
  x,
  y,
  oppositeX,
  oppositeY,
}: PropsWithChildren<Props>) => {
  const [offsetX, offsetY] = extendPointFromOrigin(
    x,
    y,
    oppositeX,
    oppositeY,
    sizeX6Px
  );

  return (
    <SvgLabel
      backgroundColor="text-shade-1"
      borderRadius={4}
      paddingHorizontal={6}
      paddingVertical={1}
      size="x2"
      weight="x2"
      isVisible={isVisible}
      text={text}
      textColor="background-shade-1"
      targetX={x}
      targetY={y}
      offsetX={offsetX}
      offsetY={offsetY}
    />
  );
};

export default GraphLabel;
