import { Box } from 'preshape';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { UseGraphResult, getCurrentTraversal } from '../useGraph';
import {
  IntersectionExplorerContext,
  IntersectionExplorerContextProps,
} from './useIntersectionExplorerContext';

export type IntersectionExplorerProviderProps = UseGraphResult & {
  activeNodeIndex?: number;
};

export default function IntersectionExplorerProvider({
  activeNodeIndex,
  children,
  ...rest
}: PropsWithChildren<IntersectionExplorerProviderProps>) {
  const refContainer = useRef<HTMLElement>(null);
  const [activeNodeIndexLocal, setActiveNodeIndex] = useState(-1);
  const [activeTraversalIndex, setActiveTraversalIndex] = useState(-1);
  const [isConfigMenuOpen, setIsConfigMenuOpen] = useState(false);
  const [speed, setSpeed] = useState(1);
  const currentTraversal = getCurrentTraversal(rest.graph.traversals);
  const currentTraversalNode =
    currentTraversal?.path[currentTraversal.path.length - 1];

  const reset = () => {
    setActiveNodeIndex(-1);
    setActiveTraversalIndex(-1);
  };

  const disableInteractions = () => {
    if (refContainer.current) {
      refContainer.current.style.pointerEvents = 'none';
    }
  };

  const enableInteractions = () => {
    if (refContainer.current) {
      refContainer.current.style.pointerEvents = '';
    }
  };

  const context: IntersectionExplorerContextProps = {
    activeNodeIndex: activeNodeIndexLocal,
    activeTraversalIndex: activeTraversalIndex,
    currentTraversal,
    currentTraversalNode,
    isConfigMenuOpen,
    isTraversing: !!currentTraversal,
    speed,
    setActiveNodeIndex,
    setActiveTraversalIndex,
    setIsConfigMenuOpen,
    setSpeed,
    ...rest,
  };

  useEffect(() => {
    disableInteractions();
  }, [rest.graph]);

  useEffect(() => {
    setActiveNodeIndex(activeNodeIndex ?? -1);
  }, [activeNodeIndex]);

  return (
    <IntersectionExplorerContext.Provider value={context}>
      <Box flex="vertical" grow onPointerMove={() => enableInteractions()}>
        <Box
          flex="vertical"
          grow
          onPointerLeave={reset}
          onPointerOver={reset}
          ref={refContainer}
        >
          {children}
        </Box>
      </Box>
    </IntersectionExplorerContext.Provider>
  );
}
