import { Edge, Graph, Node, Traversal } from '../useGraph';

const sortActiveFn =
  (traversal: Traversal | null) => (a: Node | Edge, b: Node | Edge) => {
    // Send previously traversed nodes to the top.
    if (traversal) {
      // Sort by their location in the path.
      if (a.state.isPrevious && b.state.isPrevious) {
        return (
          traversal.path.indexOf(a.index) - traversal.path.indexOf(b.index)
        );
      }

      if (a.state.isPrevious) return -1;
      if (b.state.isPrevious) return 1;
    }

    // After the previously traversed nodes, we show the current node.
    if (a.state.isCurrent) return -1;
    if (b.state.isCurrent) return 1;

    // Below the current node, we show the next nodes to be traversed to.
    if (a.state.isNext && b.state.isNext) {
      // Both of the nodes are valid, sort by their index.
      if (a.state.isValid[0] && b.state.isValid[0]) {
        return a.index - b.index;
      }

      // We want to show the valid ones before the invalid ones.
      if (a.state.isValid[0]) return -1;
      if (b.state.isValid[0]) return 1;

      // Both of the node are invalid, sort by their index.
      return a.index - b.index;
    }

    if (a.state.isNext) return -1;
    if (b.state.isNext) return 1;

    return a.index - b.index;
  };

const getSortedNodes = (graph: Graph, traversal: Traversal | null) => {
  return [...graph.nodes, ...graph.edges]
    .filter(({ state }) => state.isPrevious || state.isCurrent || state.isNext)
    .sort(sortActiveFn(traversal));
};

export default getSortedNodes;
