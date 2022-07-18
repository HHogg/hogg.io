import Bitset from 'bitset';
import { Circle, atan2, getIntersectionPoints } from './circle';
import { Edge } from './edge';
import { ValidationRuleResult, Validations } from './validate';
import { GraphContext } from '.';

export type Node = {
  [n: number]: number;
  circles: [number, number];
  index: number;
  isEdge: boolean;
  isNode: boolean;
  state: NodeState;
  x: number;
  y: number;
};

export interface NodeState {
  /**
   * Indicates if the node if a traversal is currently sitting at this node.
   * There should only ever be x1 of these during a inprogress traversal.
   */
  isCurrent: boolean;
  /**
   * Indicates if the node is a direct sibling to the isCurrent node.
   * There should be x4 of these for a traversal in progress.
   */
  isNext: boolean;
  /**
   * Indicates if the node is a past traversal on an inprogress
   * traversal.
   */
  isPrevious: boolean;
  /**
   * Indicates that the node can be added to the traversal.
   *
   * (For a node the only time it can be selected is to start of a
   * traversal, so it's only true when no traversal is in progress.)
   */
  isSelectable: boolean;
  /**
   * Indicates that the node should be visible, whether it is selectable
   * or not.
   */
  isVisible: boolean;
  /**
   * Information about each of the validations for the rules that
   * describe the traversals.
   */
  isValid: Validations;
}

const blankNodeState: NodeState = {
  isCurrent: false,
  isNext: true,
  isPrevious: false,
  isSelectable: true,
  isVisible: true,
  isValid: [
    null,
    { number: 1, isValid: null, message: '' },
    { number: 2, isValid: null, message: '' },
    { number: 3, isValid: null, message: '' },
    { number: 4, isValid: null, message: '' },
  ],
};

/**
 *
 * @param circles
 * @returns
 */
export const getNodes = (circles: Circle[]): Node[] => {
  const nodes: Node[] = [];

  for (let i = 0; i < circles.length; i++) {
    for (let j = i + 1; j < circles.length; j++) {
      const a = circles[i];
      const b = circles[j];
      const points = getIntersectionPoints(a, b);

      if (points) {
        const [[p1x, p1y], [p2x, p2y]] = points;

        const node1: Node = {
          [i]: atan2(p1x, p1y, a.x, a.y),
          [j]: atan2(p1x, p1y, b.x, b.y),
          circles: [i, j],
          index: nodes.length,
          isEdge: false,
          isNode: true,
          state: blankNodeState,
          x: p1x,
          y: p1y,
        };

        const node2: Node = {
          [i]: atan2(p2x, p2y, a.x, a.y),
          [j]: atan2(p2x, p2y, b.x, b.y),
          circles: [i, j],
          index: nodes.length + 1,
          isEdge: false,
          isNode: true,
          state: blankNodeState,
          x: p2x,
          y: p2y,
        };

        nodes.push(node1, node2);
      }
    }
  }

  return nodes;
};

/**
 *
 * @param {Node} node
 * @param {GraphContext} context
 * @returns {NodeState}
 */
export const getNodeState = (node: Node, context: GraphContext): NodeState => {
  const { traversalCurrent, traversals } = context;
  const traversalTail =
    traversalCurrent && traversalCurrent.path[traversalCurrent.path.length - 1];
  const traversalCount = traversals.reduce(
    (n, { bitset }) => n + bitset.get(node.index),
    0
  );

  // The current node is the last node to be traversed to.
  const isCurrent = traversalTail === node.index;

  // If the node index exists in the bitset, then it's been visited.
  const isPrevious =
    !!traversalCurrent && traversalCurrent.bitset.get(node.index) === 1;

  //
  const isNext = !traversalCurrent;

  const emptyRuleStates: [
    ValidationRuleResult,
    ValidationRuleResult,
    ValidationRuleResult,
    ValidationRuleResult
  ] = [
    { number: 1, isValid: null, message: '' },
    { number: 2, isValid: null, message: '' },
    { number: 3, isValid: null, message: '' },
    { number: 4, isValid: null, message: '' },
  ];

  const isValid: Validations =
    traversalCurrent === null
      ? [traversalCount < 4 ? true : null, ...emptyRuleStates]
      : [null, ...emptyRuleStates];

  // A node is only selectable when no traversal is in progress,
  // after than, you only interact with edges.
  const isSelectable = !!isValid[0] && traversalCurrent === null;

  // Nodes are only visible when they can be selected (the first point)
  // and when they have been visited.
  const isVisible = isSelectable || isPrevious;

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
 * @param {number} a Index of the fist node
 * @param {number} b Index of the second node
 * @param {Edge[]} edges
 */
export const areNodesConnected = (a: number, b: number, edges: Edge[]) => {
  return edges.some(({ bitset }) =>
    bitset.equals(new Bitset().set(a, 1).set(b, 1))
  );
};
