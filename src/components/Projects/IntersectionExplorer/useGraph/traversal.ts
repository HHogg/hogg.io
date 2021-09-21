import Bitset from 'bitset';
import { Edge } from './edge';

export interface Traversal {
  /**
   *
   */
  index: number;
  /**
   * A flag to indicate if the traversal is complete.
   * Essentially it is a flag that is set when the head point
   * matches the tail point.
   */
  isComplete: boolean;
  /**
   * A Bitset instance that is used to identify
   * which nodes and edges on the graph have been
   * visited.
   */
  bitset: Bitset;
  /**
   * An array of points that have been traversed on the graph.
   * It follows the pattern of [Node, Edge, Node, Edge, Node, ...etc]
   */
  path: number[];
}

/**
 * @param {number} node Node to start the traversal at
 * @returns {Traversal} A new Traversal
 */
export const getNewTraversal = (index: number, node?: number): Traversal => ({
  index: index,
  bitset: new Bitset().set(node, 1),
  isComplete: false,
  path: node === undefined ? [] : [node],
});

/**
 * @param {Traversal} traversal The traversal to add the point to
 * @param {Edge} edge The edge to be added to the traversal.
 * @returns {Traversal} A traversal object with the appended point
 */
export const appendEdgeToPath = ({ bitset, index, path }: Traversal, { index: edgeIndex, nodes }: Edge): Traversal => {
  const nodeLast = path[path.length - 1];
  const nodeNext = nodes[0] === nodeLast ? nodes[1] : nodes[0];

  return {
    index: index,
    bitset: bitset.clone().set(edgeIndex, 1).set(nodeNext, 1),
    isComplete: nodeNext === path[0],
    path: [...path, edgeIndex, nodeNext],
  };
};

/**
 * @param {Traversal[]} traversals The complete and incomplete traversals
 * @returns {Traversal|null} An incomplete Traversal or null
 */
export const getCurrentTraversal = (traversals: Traversal[]): Traversal | null => {
  if (traversals[traversals.length - 1] && !traversals[traversals.length - 1].isComplete) {
    return traversals[traversals.length - 1];
  }

  return null;
};

/**
 * @param {Traversal[]} traversals A list of complete and incomplete Traversals
 * @returns {Traversal[]} A list of complete traversals
 */
export const getCompleteTraversals = (traversals: Traversal[]): Traversal[] => {
  return traversals.filter(({ isComplete }) => isComplete);
};
