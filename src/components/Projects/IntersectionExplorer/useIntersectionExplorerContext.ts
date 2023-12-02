import { createContext, useContext } from 'react';
import { Traversal, UseGraphResult } from './useGraph';

export type IntersectionExplorerContextProps = UseGraphResult & {
  activeNodeIndex: number;
  activeTraversalIndex: number;
  currentTraversal: Traversal | null;
  currentTraversalNode?: number;
  isTraversing: boolean;
  setActiveNodeIndex: (index: number) => void;
  setActiveTraversalIndex: (index: number) => void;
};

export const IntersectionExplorerContext =
  createContext<IntersectionExplorerContextProps>({
    activeNodeIndex: -1,
    activeTraversalIndex: -1,
    currentTraversal: null,
    currentTraversalNode: undefined,
    isTraversing: false,
    addToTraversal: () => {},
    cancelTraversal: () => {},
    removeTraversal: () => {},
    setActiveNodeIndex: () => {},
    setActiveTraversalIndex: () => {},
    graph: {
      circles: [],
      edges: [],
      nodes: [],
      traversals: [],
    },
  });

export default function useIntersectionExplorerContext() {
  return useContext(IntersectionExplorerContext);
}
