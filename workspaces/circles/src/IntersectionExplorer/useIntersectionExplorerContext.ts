import { createContext, useContext } from 'react';
import { Traversal, UseGraphResult } from '../useGraph';

export type IntersectionExplorerContextProps = UseGraphResult & {
  activeNodeIndex: number;
  activeTraversalIndex: number;
  currentTraversal: Traversal | null;
  currentTraversalNode?: number;
  isConfigMenuOpen: boolean;
  isTraversing: boolean;
  speed: number;
  setActiveNodeIndex: (index: number) => void;
  setActiveTraversalIndex: (index: number) => void;
  setIsConfigMenuOpen: (isOpen: boolean) => void;
  setSpeed: (speed: number) => void;
};

export const IntersectionExplorerContext =
  createContext<IntersectionExplorerContextProps>({
    activeNodeIndex: -1,
    activeTraversalIndex: -1,
    currentTraversal: null,
    currentTraversalNode: undefined,
    isConfigMenuOpen: false,
    isTraversing: false,
    speed: 1,
    addToTraversal: () => {},
    cancelTraversal: () => {},
    clearTraversals: () => {},
    connectNextNode: () => {},
    disconnectPreviousNode: () => {},
    removeTraversal: () => {},
    setActiveNodeIndex: () => {},
    setActiveTraversalIndex: () => {},
    setIsConfigMenuOpen: () => {},
    setSpeed: () => {},
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
