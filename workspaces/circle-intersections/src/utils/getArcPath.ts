import { Edge, Node } from '../useGraph';

const getArcPath = (
  edge: Edge,
  nodes: Node[],
  start = true,
  reverse = false
): string => {
  const {
    angleStart,
    angleEnd,
    nodes: [a, b],
    radius,
  } = edge;
  const { x: sx, y: sy } = reverse ? nodes[b] : nodes[a];
  const { x: ex, y: ey } = reverse ? nodes[a] : nodes[b];

  const largeArcFlag = Math.abs(angleEnd - angleStart) >= Math.PI ? 1 : 0;
  const sweepFlag = reverse ? 0 : 1;

  return (
    (start ? `M ${sx} ${sy} ` : '') +
    `A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${ex} ${ey} `
  );
};

export default getArcPath;
