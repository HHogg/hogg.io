import Bitset from 'bitset';
import isPointWithinCircle from '../../CircleArt/utils/math/isPointWithinCircle';
import { Circle } from './circle';
import { Edge } from './edge';
import { getUpdatedGraphState, Graph } from './graph';
import { Node } from './node';

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
 *
 */
export const addIndexToTraversal = ({ traversals, nodes, edges }: Graph, index: number) => {
  const currentTraversal = getCurrentTraversal(traversals);

  if (currentTraversal) {
    if (index < nodes.length) {
      throw new Error(
        'Once a traversal has been started, only edges can be added.'
      );
    }

    return [
      ...traversals.slice(0, -1),
      appendEdgeToPath(
        currentTraversal,
        edges[index - nodes.length]
      ),
    ];
  } else {
    return [...traversals, getNewTraversal(traversals.length, index)];
  }
};

/**
 * @param {Traversal} traversal The traversal to add the point to
 * @param {Edge} edge The edge to be added to the traversal.
 * @returns {Traversal} A traversal object with the appended point
 */
export const appendEdgeToPath = (
  { bitset, index, path }: Traversal,
  { index: edgeIndex, nodes }: Edge
): Traversal => {
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
export const getCurrentTraversal = (
  traversals: Traversal[]
): Traversal | null => {
  if (
    traversals[traversals.length - 1] &&
    !traversals[traversals.length - 1].isComplete
  ) {
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

/**
 *
 */
export const removeTraversal = (traversals: Traversal[], index: number) => {
  return [
    ...traversals.slice(0, index),
    ...traversals.slice(index + 1),
  ];
};

/**
 *
 */
export const cancelCurrentTraversal = (traversals: Traversal[]) => {
  return removeTraversal(traversals, traversals.length - 1);
};

/**
 *
 */
export const getTraversals = (circles: Circle[], nodes: Node[], edges: Edge[]): Traversal[] => {
  let graph: Graph = getUpdatedGraphState({ circles, nodes, edges, traversals: [] });

  const links: Record<number, number[]> = {};

  for (const edge of graph.edges) {
    for (const nodeIndex of edge.nodes) {
      links[nodeIndex] = links[nodeIndex] || [];
      links[nodeIndex].push(edge.index);
    }
  }

  const traverseEdges = (fromNodeIndex: number) => {
    let hasPath = false;

    for (const edgeIndex of links[fromNodeIndex]) {
      if (!getCurrentTraversal(graph.traversals)) {
        graph = getUpdatedGraphState({
          ...graph,
          traversals: addIndexToTraversal(graph, fromNodeIndex),
        });
      }

      if (graph.edges[edgeIndex- graph.nodes.length].state.isSelectable) {
        hasPath = true;

        graph = getUpdatedGraphState({
          ...graph,
          traversals: addIndexToTraversal(graph, edgeIndex),
        });

        const currentTraversal = getCurrentTraversal(graph.traversals);

        if (currentTraversal && !currentTraversal.isComplete) {
          traverseEdges(currentTraversal.path[currentTraversal.path.length - 1]);
        }
      }
    }

    if (!hasPath) {
      graph = getUpdatedGraphState({
        ...graph,
        traversals: cancelCurrentTraversal(graph.traversals),
      });
    }
  };

  for (const node of graph.nodes) {
    if (node.state.isSelectable) {
      traverseEdges(node.index);
    }
  }

  return graph.traversals.filter(({ path }) => {
    const edges = path
      .filter((index) => index >= graph.nodes.length)
      .map((edgeIndex) => graph.edges[edgeIndex - graph.nodes.length]);

    for (const edge of edges) {
      for (let circleIndex = 0; circleIndex < graph.circles.length; circleIndex ++) {
        const { x: cx, y: cy, radius: cr } = graph.circles[circleIndex];

        if (circleIndex !== edge.circle && isPointWithinCircle(edge.x, edge.y, cx, cy, cr)) {
          return true;
        }
      }
    }

    return false
  });
}
