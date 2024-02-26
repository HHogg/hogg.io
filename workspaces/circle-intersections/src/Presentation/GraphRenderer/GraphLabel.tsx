import { SvgLabel } from '@hogg/common';
import { PropsWithChildren } from 'react';

type Props = {
  isVisible: boolean;
  text: string;
  x: number;
  y: number;
};

const GraphLabel = ({ isVisible, text, x, y }: PropsWithChildren<Props>) => {
  return (
    <SvgLabel
      backgroundColor="background-shade-2"
      borderRadius={2}
      paddingHorizontal={4}
      paddingVertical={2}
      size="x3"
      weight="x2"
      isVisible={isVisible}
      text={text}
      x={x}
      y={y}
    />
  );
};

export default GraphLabel;
