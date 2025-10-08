import { useSvgLabelsContext } from '@hogg/common';
import { sizeX1Px } from 'preshape';
import { SVGAttributes, forwardRef, useEffect } from 'react';
import { Edge, Node } from '../../useGraph';
import GraphNodePoint from './GraphNodePoint';

type Props = SVGAttributes<SVGGElement> & {
  node: Node | Edge;
  strokeWidth?: number;
  x: number;
  y: number;
};

const GraphNode = forwardRef<SVGGElement, Props>(function GraphNodeInner(
  props,
  ref
) {
  const { node, x, y } = props;
  const { registerObstacle } = useSvgLabelsContext();

  useEffect(() => {
    return registerObstacle({
      id: `node-${node.index}`,
      type: 'solid',
      padding: sizeX1Px,
      geometry: {
        radius: 6,
        x,
        y,
      },
    });
  }, [registerObstacle, node, x, y]);

  return <GraphNodePoint {...props} ref={ref} />;
});

export default GraphNode;
