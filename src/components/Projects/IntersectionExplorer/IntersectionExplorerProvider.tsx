import classnames from 'classnames';
import { Box, useMatchMedia } from 'preshape';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { UseGraphResult } from './useGraph';
import { getCurrentTraversal } from './useGraph/traversal';
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
  const match = useMatchMedia(['1000px', '1300px']);
  const refContainer = useRef<HTMLElement>(null);
  const [activeNodeIndexLocal, setActiveNodeIndex] = useState(-1);
  const [activeTraversalIndex, setActiveTraversalIndex] = useState(-1);
  const currentTraversal = getCurrentTraversal(rest.graph.traversals);
  const currentTraversalNode =
    currentTraversal?.path[currentTraversal.path.length - 1];

  const className = classnames(
    'IntersectionExplorer',
    match({
      '1300px': 'IntersectionExplorer--300',
      '1000px': 'IntersectionExplorer--120',
    }) || 'IntersectionExplorer--111'
  );

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
    isTraversing: !!currentTraversal,
    setActiveNodeIndex,
    setActiveTraversalIndex,
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
      <Box
        flex="vertical"
        grow
        minHeight="400px"
        onPointerMove={() => enableInteractions()}
      >
        <Box
          backgroundColor="background-shade-1"
          className={className}
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
