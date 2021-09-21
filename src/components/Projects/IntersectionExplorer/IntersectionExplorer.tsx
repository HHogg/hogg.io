import { Box, useMatchMedia } from 'preshape';
import React, { createContext, useEffect, useRef, useState } from 'react';
import GraphVisualisation from './GraphVisualisation/GraphVisualisation';
import NodeList from './NodeList/NodeList';
import TraversalList from './TraversalList/TraversalList';
import { Circle, HookResult } from './useGraph';
import './IntersectionExplorer.css';
import classnames from 'classnames';

interface Context extends HookResult {
  activeNodeIndex: number;
  activeTraversalIndex: number;
}

export const sampleCircles: Circle[] = [
  { radius: 0.25, x: 0, y: 0 },

  { radius: 0.25, x: -0.2, y: -0.2 },
  { radius: 0.25, x: -0.2, y: +0.2 },
  { radius: 0.25, x: +0.2, y: -0.2 },
  { radius: 0.25, x: +0.2, y: +0.2 },

  { radius: 0.15, x: -0.35, y: -0.35 },
  { radius: 0.15, x: -0.35, y: +0.35 },
  { radius: 0.15, x: +0.35, y: -0.35 },
  { radius: 0.15, x: +0.35, y: +0.35 },
];

export const IntersectionExplorerContext = createContext<Context>({
  activeNodeIndex: -1,
  activeTraversalIndex: -1,
  addToTraversal: () => {},
  cancelTraversal: () => {},
  removeTraversal: () => {},
  graph: {
    circles: [],
    edges: [],
    nodes: [],
  },
  traversals: [],
});

const IntersectionExplorer = ({ activeNodeIndex, ...rest }: HookResult & { activeNodeIndex?: number }) => {
  const [activeNodeIndexLocal, setActiveNodeIndex] = useState(-1);
  const [activeTraversalIndex, setActiveTraversalIndex] = useState(-1);
  const refContainer = useRef<HTMLElement>(null);
  const match = useMatchMedia(['1000px', '1300px']);

  const className = classnames('IntersectionExplorer', match({
    '1300px': 'IntersectionExplorer--300',
    '1000px': 'IntersectionExplorer--120',
  }) || 'IntersectionExplorer--111');

  const context: Context = {
    activeNodeIndex: activeNodeIndexLocal,
    activeTraversalIndex: activeTraversalIndex,
    ...rest,
  };

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

  useEffect(() => {
    disableInteractions();
  }, [rest.graph]);

  useEffect(() => {
    setActiveNodeIndex(activeNodeIndex ?? -1);
  }, [activeNodeIndex]);

  return (
    <IntersectionExplorerContext.Provider value={ context }>
      <Box
          flex="vertical"
          grow
          minHeight="400px"
          onPointerMove={ () => enableInteractions() }>
        <Box
            backgroundColor="background-shade-1"
            className={ className }
            grow
            onPointerLeave={ reset }
            onPointerOver={ reset }
            padding="x10"
            ref={ refContainer }>
          <Box>
            <NodeList
                onNodeOver={ (i) => setActiveNodeIndex(i) } />
          </Box>

          <Box
              alignChildrenVertical="start"
              flex="vertical"
              grow="2">
            <GraphVisualisation
                onNodeOver={ (i) => setActiveNodeIndex(i) }
                onTraversalOver={ (i) => setActiveTraversalIndex(i) } />
          </Box>

          <Box>
            <TraversalList
                onTraversalOver={ (i) => setActiveTraversalIndex(i) } />
          </Box>
        </Box>
      </Box>
    </IntersectionExplorerContext.Provider>
  );
};

export default IntersectionExplorer;
