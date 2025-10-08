import { forwardRef } from 'react';
import { Edge, Node } from '../../useGraph';
import GraphNodePoint from '../GraphRenderer/GraphNodePoint';

type Props = {
  node: Node | Edge;
  connectionLineLength?: number;
  size?: number;
};

const NodeIcon = forwardRef<SVGSVGElement, Props>((props, ref) => {
  const { node, size = 12 } = props;
  return (
    <svg height={size} ref={ref} viewBox={`0 0 ${size} ${size}`} width={size}>
      <GraphNodePoint node={node} x={size / 2} y={size / 2} />
    </svg>
  );
});

export default NodeIcon;
