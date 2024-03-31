import { Box, BoxProps } from 'preshape';
import { SVGAttributes } from 'react';

type Props = {
  x: number;
  y: number;
  r: number;
  thetaStart: number;
  thetaEnd: number;
};

export default function CircleSegment({
  x,
  y,
  r,
  thetaStart,
  thetaEnd,
  ...rest
}: SVGAttributes<SVGPathElement> & BoxProps & Props) {
  const reverse = false;

  const sx = x + r * Math.cos(thetaStart);
  const sy = y + r * Math.sin(thetaStart);
  const ex = x + r * Math.cos(thetaEnd);
  const ey = y + r * Math.sin(thetaEnd);

  const largeArcFlag = Math.abs(thetaEnd - thetaStart) >= Math.PI ? 1 : 0;
  const sweepFlag = reverse ? 0 : 1;

  const d = `
    M ${sx} ${sy}
    A ${r} ${r} 0
    ${largeArcFlag}
    ${sweepFlag}
    ${ex} ${ey}
    L ${x} ${y}
    Z`;

  return <Box fill="none" stroke="currentColor" {...rest} tag="path" d={d} />;
}
