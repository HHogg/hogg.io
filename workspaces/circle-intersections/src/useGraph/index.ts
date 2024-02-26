import { useCallback, useEffect, useState } from 'react';
import { Circle } from './circle';
import { Edge, getEdges } from './edge';
import { Graph, getUpdatedGraphState } from './graph';
import { Node, NodeState, getNodes } from './node';
import {
  Traversal,
  pushIndexToTraversal,
  getCurrentTraversal,
  getTraversals,
  popIndexFromTraversal,
  getCompleteTraversals,
} from './traversal';
import { ValidationRuleResult } from './validate';

export { getCurrentTraversal, getCompleteTraversals };

export type {
  Circle,
  Graph,
  Edge,
  Node,
  NodeState,
  Traversal,
  ValidationRuleResult,
};

export type UseGraphResult = {
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
  cancelTraversal: () => void;
  clearTraversals: () => void;
  connectNextNode: () => void;
  disconnectPreviousNode: () => void;
  removeTraversal: (index: number) => void;
  graph: Graph;
};

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
  opts: UseGraphOptions = {}
): UseGraphResult {
  const { findTraversalsOnUpdate = false, traversals: traversalsControlled } =
    opts;

  const [graph, setGraph] = useState<Graph>({
    circles: [],
    edges: [],
    nodes: [],
    traversals: [],
  });

  const addToTraversal = useCallback((index: number) => {
    setGraph((graph) => {
      const traversals = pushIndexToTraversal(graph, index);
      return getUpdatedGraphState({ ...graph, traversals });
    });
  }, []);

  const removeTraversal = useCallback((index: number) => {
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
  }, []);

  const cancelTraversal = useCallback(() => {
    removeTraversal(graph.traversals.length - 1);
  }, [graph.traversals.length, removeTraversal]);

  const clearTraversals = useCallback(() => {
    setGraph((graph) =>
      getUpdatedGraphState({
        ...graph,
        traversals: [],
      })
    );
  }, []);

  const connectNextNode = useCallback(() => {
    setGraph((graph) => {
      const currentTraversal = getCurrentTraversal(graph.traversals);
      const nextNode = currentTraversal
        ? graph.edges
            .filter((node) => node.state.isSelectable)
            .sort((a, b) => a.index - b.index)[0]
        : graph.nodes.filter((node) => node.state.isSelectable)[0];

      const traversals = pushIndexToTraversal(graph, nextNode.index);

      return getUpdatedGraphState({
        ...graph,
        traversals,
      });
    });
  }, []);

  const disconnectPreviousNode = useCallback(() => {
    setGraph((graph) => {
      const traversals = popIndexFromTraversal(graph);
      return getUpdatedGraphState({ ...graph, traversals });
    });
  }, []);

  /**
   * On circles changing, update the graph.
   */
  useEffect(() => {
    const nodes = getNodes(circles);
    const edges = getEdges(circles, nodes);
    const traversals = findTraversalsOnUpdate
      ? getTraversals(circles, nodes, edges)
      : [];
    const graph = getUpdatedGraphState({ circles, nodes, edges, traversals });

    setGraph(graph);
  }, [circles, findTraversalsOnUpdate]);

  useEffect(() => {
    if (traversalsControlled) {
      setGraph((graph) =>
        getUpdatedGraphState({
          ...graph,
          traversals: traversalsControlled,
        })
      );
    }
  }, [traversalsControlled]);

  return {
    addToTraversal,
    cancelTraversal,
    clearTraversals,
    connectNextNode,
    disconnectPreviousNode,
    removeTraversal,
    graph,
  };
}
