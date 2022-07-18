import { useEffect, useState } from 'react';
import { Circle } from './circle';
import { Edge, getEdges, getEdgeState } from './edge';
import { Node, NodeState, getNodes, getNodeState } from './node';
import {
  Traversal,
  appendEdgeToPath,
  getNewTraversal,
  getCurrentTraversal,
  getCompleteTraversals,
} from './traversal';
import { ValidationRuleResult } from './validate';

export { Circle, Edge, Node, NodeState, Traversal, ValidationRuleResult };

export interface Graph {
  circles: Circle[];
  edges: Edge[];
  nodes: Node[];
}

export interface GraphState {
  edges: NodeState[];
  nodes: NodeState[];
}

export interface GraphContext {
  circles: Circle[];
  edges: Edge[];
  nodes: Node[];
  traversals: Traversal[];
  traversalCurrent: Traversal | null;
  traversalCurrentNode: number | null;
  traversalsComplete: Traversal[];
}

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
  graph: Graph;
  /**
   *
   */
  removeTraversal: (index: number) => void;
  /**
   *
   */
  traversals: Traversal[];
}

/** Consistent referenced array */
const DONT_REMOVE__READ_COMMENT: [] = [];

/**
 *
 * @param circles
 * @returns
 */
export default function useGraph(
  circles: Circle[],
  traversalsControlled: Traversal[] = DONT_REMOVE__READ_COMMENT
): HookResult {
  const [traversals, setTraversals] = useState<Traversal[]>([]);
  const [graph, setGraph] = useState<Graph>({
    circles: circles,
    edges: [],
    nodes: [],
  });

  const addToTraversal = (point: number) => {
    const currentTraversal = getCurrentTraversal(traversals);

    if (currentTraversal) {
      if (point < graph.nodes.length) {
        throw new Error(
          'Once a traversal has been started, only edges can be added.'
        );
      }

      setTraversals([
        ...traversals.slice(0, -1),
        appendEdgeToPath(
          currentTraversal,
          graph.edges[point - graph.nodes.length]
        ),
      ]);
    } else {
      setTraversals([...traversals, getNewTraversal(traversals.length, point)]);
    }
  };

  const removeTraversal = (index: number) => {
    setTraversals((traversals) => [
      ...traversals.slice(0, index),
      ...traversals.slice(index + 1),
    ]);
  };

  const cancelTraversal = () => {
    removeTraversal(traversals.length - 1);
  };

  /**
   * On circles changing, update the graph.
   */
  useEffect(() => {
    const nodes = getNodes(circles);
    const edges = getEdges(circles, nodes);

    setGraph({ circles, nodes, edges });
  }, [circles]);

  /**
   * On traversals changing, update the graph state.
   */
  useEffect(() => {
    const traversalCurrent = getCurrentTraversal(traversals);
    const traversalCurrentNode =
      traversalCurrent &&
      traversalCurrent.path[traversalCurrent.path.length - 1];
    const traversalsComplete = getCompleteTraversals(traversals);

    const context: GraphContext = {
      ...graph,
      traversalCurrent,
      traversalCurrentNode,
      traversals,
      traversalsComplete,
    };

    setGraph((graph) => ({
      ...graph,
      edges: graph.edges.map((edge) => ({
        ...edge,
        state: getEdgeState(edge, context),
      })),
      nodes: graph.nodes.map((node) => ({
        ...node,
        state: getNodeState(node, context),
      })),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [traversals]);

  useEffect(() => {
    setTraversals(traversalsControlled);
  }, [traversalsControlled]);

  return {
    addToTraversal,
    cancelTraversal,
    removeTraversal,
    graph,
    traversals,
  };
}
