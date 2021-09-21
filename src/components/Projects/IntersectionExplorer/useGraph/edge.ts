import Bitset from 'bitset';
import { Circle } from './circle';
import { Node, NodeState } from './node';
import { validateEdge } from './validate';
import { GraphContext } from '.';

export type Edge = {
  angleStart: number;
  angleEnd: number;
  bitset: Bitset;
  circle: number;
  index: number;
  isEdge: boolean;
  isNode: boolean;
  nodes: [number, number];
  radius: number;
  state: NodeState;
  x: number;
  y: number;
}

const blankEdgeState: NodeState = {
  isCurrent: false,
  isNext: false,
  isPrevious: false,
  isSelectable: false,
  isValid: [
    false,
    { number: 1, isValid: null, message: '' },
    { number: 2, isValid: null, message: '' },
    { number: 3, isValid: null, message: '' },
    { number: 4, isValid: null, message: '' },
  ],
  isVisible: false,
};

/**
 * @param {Circle[]} circles
 * @param {Node[]} nodes
 * @returns {Edge[]}
 */
export const getEdges = (circles: Circle[], nodes: Node[]): Edge[] => {
  const edges: Edge[] = [];

  for (let c = 0; c < circles.length; c++) {
    const circleNodes = nodes
      .filter((node) => c in node)
      .sort((a, b) => a[c] - b[c]);

    for (let i = 0; i < circleNodes.length; i++) {
      const a = circleNodes[i];
      const b = circleNodes[i + 1] || circleNodes[0];
      const { radius, x, y } = circles[c];

      const angleStart = a[c] > b[c] ? a[c] - Math.PI * 2 : a[c];
      const angleEnd = b[c];

      const m = angleStart + (0.5 * (angleEnd - angleStart));
      const mx = x + radius * Math.cos(m);
      const my = y + radius * Math.sin(m);

      edges.push({
        angleStart: angleStart,
        angleEnd: angleEnd,
        bitset: new Bitset().set(a.index, 1).set(b.index, 1),
        circle: c,
        index: nodes.length + edges.length,
        isEdge: true,
        isNode: false,
        nodes: [a.index, b.index],
        radius: radius,
        state: blankEdgeState,
        x: mx,
        y: my,
      });
    }
  }

  return edges;
};

/**
 * @param {Edge} edge
 * @param {GraphContext} context
 * @returns {NodeState[]}
 */
export const getEdgeState = (edge: Edge, context: GraphContext): NodeState => {
  const { traversalCurrent } = context;
  const traversalTail = traversalCurrent && traversalCurrent.path[traversalCurrent.path.length - 1];

  // Indicates if the edge is next to the current traversed node,
  // this doesn't necessarily mean it is a valid connection though.
  const isNext = traversalTail !== null && edge.bitset.get(traversalTail) === 1;

  // The overall and individual validation results.
  const isValid = isNext ? validateEdge(edge, context) : blankEdgeState.isValid;

  // Edges are never current. They are just used to indicate direction,
  // a node is always the last to be visited.
  const isCurrent = false;

  // If the edge index exists in the bitset, then it's been visited.
  const isPrevious = !!traversalCurrent && traversalCurrent.bitset.get(edge.index) === 1;

  // The flag to indicate that the edge can be
  // added to the current traversal.
  const isSelectable =
    // When there isn't a traversal in progress you
    // can't select an edge first
    traversalCurrent !== null &&
    // You can only select edges that are connected to the current node
    isNext &&
    // You can only select edges that have passed all the validation checks.
    (isValid[0] === true || isValid[0] === null);

  // Indicates that the edge should be visible on the graph.
  const isVisible = isPrevious || isNext;

  return {
    isCurrent,
    isNext,
    isPrevious,
    isSelectable,
    isVisible,
    isValid,
  };
};


/**
 *
 * @param {Edge} edge
 * @param {number} nodeIndex
 * @returns {number|null}
 */
export const getOppositeEndNode = (edge: Edge, nodeIndex: null | number): number | null => {
  if (edge.nodes[0] === nodeIndex) return edge.nodes[1];
  if (edge.nodes[1] === nodeIndex) return edge.nodes[0];

  return null;
};
