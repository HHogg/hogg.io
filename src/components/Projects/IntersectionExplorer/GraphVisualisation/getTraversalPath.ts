import { Traversal, Edge, Node } from "../useGraph";
import getArcPath from "./getArcPath";

const getTraversalPath = (
  traversal: Traversal,
  nodes: Node[],
  edges: Edge[]
): string => {
  let path = '';

  for (let i = 1; i < traversal.path.length; i += 2) {
    const e = traversal.path[i] - nodes.length;
    const a = traversal.path[i - 1];
    const reverse = edges[e].nodes[0] !== a;

    path +=
      getArcPath(
        edges[traversal.path[i] - nodes.length],
        nodes,
        i === 1,
        reverse
      ) + ' ';
  }

  return path;
};

export default getTraversalPath;
