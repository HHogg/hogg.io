
import { Circle } from "./circle";
import { Edge, getEdgeState } from "./edge";
import { getNodeState, Node, NodeState } from "./node";
import { getCurrentTraversal, getCompleteTraversals, Traversal } from "./traversal";

export interface Graph {
  circles: Circle[];
  edges: Edge[];
  nodes: Node[];
  traversals: Traversal[];
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

/**
 *
 */
 export const getUpdatedGraphState = (graph: Graph): Graph => {
  const traversalCurrent = getCurrentTraversal(graph.traversals);
  const traversalCurrentNode =
    traversalCurrent &&
    traversalCurrent.path[traversalCurrent.path.length - 1];
  const traversalsComplete = getCompleteTraversals(graph.traversals);

  const context: GraphContext = {
    ...graph,
    traversalCurrent,
    traversalCurrentNode,
    traversalsComplete,
  };

  return {
    ...graph,
    edges: graph.edges.map((edge) => ({
      ...edge,
      state: getEdgeState(edge, context),
    })),
    nodes: graph.nodes.map((node) => ({
      ...node,
      state: getNodeState(node, context),
    })),
  };
};
