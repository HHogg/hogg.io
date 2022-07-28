import { useEffect, useState } from 'react';
import { Circle } from './circle';
import { Edge, getEdges } from './edge';
import { Graph, getUpdatedGraphState } from './graph';
import { Node, NodeState, getNodes } from './node';
import {
  Traversal,
  addIndexToTraversal,
  getTraversals,
} from './traversal';
import { ValidationRuleResult } from './validate';

export { Circle, Graph, Edge, Node, NodeState, Traversal, ValidationRuleResult };

export interface HookResult {
  /**
   * Given a point to traverse to, this creates or amends
   * a traversal with the point given.
   *
   * @param {number} point The point on the graph to traverse to. This
   * can be either a node or edge point. When it's a node point (the
   * initial starting point) it's just added, when it's an edge, it
   * finds the edge and also appends the node at the end of the edge.
   */
  addToTraversal: (point: number) => void;
  /**
   *
   */
  cancelTraversal: () => void;
  /**
   *
   */
  removeTraversal: (index: number) => void;
  /**
   *
   */
  graph: Graph;
}

type UseGraphOptions = {
  findTraversalsOnUpdate?: boolean;
  traversals?: Traversal[];
};

/**
 *
 * @param circles
 * @returns
 */
export default function useGraph(
  circles: Circle[],
  opts: UseGraphOptions = {},
): HookResult {
  const {
    findTraversalsOnUpdate = false,
    traversals: traversalsControlled,
  } = opts;

  const [graph, setGraph] = useState<Graph>({
    circles: [],
    edges: [],
    nodes: [],
    traversals: [],
  });

  const addToTraversal = (index: number) => {
    setGraph((graph) => {
      const traversals = addIndexToTraversal(graph, index);
      return getUpdatedGraphState({ ...graph, traversals });
    });
  };

  const removeTraversal = (index: number) => {
    setGraph((graph) => {
      const traversals = [
        ...graph.traversals.slice(0, index),
        ...graph.traversals.slice(index + 1),
      ];

      return getUpdatedGraphState({
        ...graph,
        traversals,
      });
    });
  };

  const cancelTraversal = () => {
    removeTraversal(graph.traversals.length - 1);
  };

  /**
   * On circles changing, update the graph.
   */
  useEffect(() => {
    const nodes = getNodes(circles);
    const edges = getEdges(circles, nodes);
    const traversals = findTraversalsOnUpdate ? getTraversals(circles, nodes, edges) : [];
    const graph = getUpdatedGraphState({ circles, nodes, edges, traversals });

    setGraph(graph);
  }, [circles, findTraversalsOnUpdate]);

  useEffect(() => {
    if (traversalsControlled) {
      setGraph((graph) => getUpdatedGraphState({
        ...graph,
        traversals: traversalsControlled,
      }));
    }
  }, [traversalsControlled]);

  return {
    addToTraversal,
    cancelTraversal,
    removeTraversal,
    graph,
  };
}
