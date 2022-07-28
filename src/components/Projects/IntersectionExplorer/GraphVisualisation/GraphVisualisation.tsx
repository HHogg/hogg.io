import classNames from 'classnames';
import { motion } from 'framer-motion';
import { Box, useResizeObserver } from 'preshape';
import React, { useContext, useMemo, useRef, PointerEvent } from 'react';
import { IntersectionExplorerContext } from '../IntersectionExplorer';
import GraphVisualisationEdge from './GraphVisualisationEdge';
import GraphVisualisationLabel from './GraphVisualisationLabel';
import GraphVisualisationNode from './GraphVisualisationNode';
import GraphVisualisationTraversal from './GraphVisualisationTraversal';
import getArcPath from './getArcPath';
import getScaledProps from './getScaledProps';
import getTraversalPath from './getTraversalPath';
import useLabelPositionShifts from './useLabelPositionShifts';
import './GraphVisualisation.css';

interface Props {
  onNodeOver: (index: number) => void;
  onTraversalOver: (index: number) => void;
}

const GraphVisualisation = ({ onNodeOver, onTraversalOver }: Props) => {
  const { activeNodeIndex, addToTraversal, graph } = useContext(
    IntersectionExplorerContext
  );
  const [size, ref] = useResizeObserver();
  const min = size.width;

  const circles = useMemo(
    () => getScaledProps(graph.circles, ['radius', 'x', 'y'], min),
    [min]
  );
  const edges = useMemo(
    () => getScaledProps(graph.edges, ['radius', 'x', 'y'], min),
    [graph, min]
  );
  const nodes = useMemo(
    () => getScaledProps(graph.nodes, ['x', 'y'], min),
    [graph, min]
  );
  const classes = classNames('GraphVisualisation', {
    'GraphVisualisation--has-active-node': activeNodeIndex > -1,
  });

  const refLabels = useRef<SVGGElement>(null);
  const refObstacles = useRef<SVGGElement>(null);
  const labelPositionShifts = useLabelPositionShifts(
    { ...graph, circles, edges, nodes },
    refLabels.current,
    refObstacles.current
  );

  const handleNodeClick = (index: number) => () => {
    addToTraversal(index);
    onNodeOver(-1);
  };

  const handleNodeOver = (index: number) => (event: PointerEvent) => {
    event.stopPropagation();
    onTraversalOver(-1);
    onNodeOver(index);
  };

  const handleTraversalOver = (index: number) => (event: PointerEvent) => {
    event.stopPropagation();
    onNodeOver(-1);
    onTraversalOver(index);
  };

  return (
    <Box container height={size.width} ref={ref}>
      <Box
        absolute="center"
        className={classes}
        height={min}
        tag="svg"
        viewBox={`${-min / 2} ${-min / 2} ${min} ${min}`}
        width={min}
      >
        <g data-group-description="Arcs">
          {/* Dark template edges */}
          {edges.map((edge) => (
            <GraphVisualisationEdge
              d={getArcPath(edge, nodes)}
              key={edge.index}
            />
          ))}

          {/* Animating yellow traversals */}
          {graph.traversals.map((traversal, index) => (
            <GraphVisualisationTraversal
              d={getTraversalPath(traversal, nodes, edges)}
              index={index}
              key={index}
              onPointerOver={
                traversal.isComplete ? handleTraversalOver(index) : undefined
              }
              traversal={traversal}
            />
          ))}
        </g>

        <g data-group-description="Label Links">
          {[...nodes, ...edges].map(({ index, state, x, y }, i) => (
            <motion.line
              animate={{
                opacity: state.isVisible ? 1 : 0,
                x1: x,
                x2:
                  x +
                  (labelPositionShifts[i]?.x || 0) -
                  (labelPositionShifts[i]?.dx || 0),
                y1: y,
                y2:
                  y +
                  (labelPositionShifts[i]?.y || 0) -
                  (labelPositionShifts[i]?.dy || 0),
              }}
              key={index}
              stroke="currentColor"
              strokeDasharray="3 3"
              strokeWidth="2"
            />
          ))}
        </g>

        <g data-group-description="Obstacles" ref={refObstacles}>
          {[...nodes, ...edges].map(({ index, state, x, y }, i) => (
            <GraphVisualisationNode
              {...state}
              isFocused={activeNodeIndex === index}
              key={index}
              n={i}
              onClick={state.isSelectable ? handleNodeClick(index) : undefined}
              onPointerOver={handleNodeOver(index)}
              x={x}
              y={y}
            />
          ))}
        </g>

        <motion.g
          animate={{ opacity: labelPositionShifts.length ? 1 : 0 }}
          data-group-description="Labels"
          ref={refLabels}
        >
          {[...nodes, ...edges].map(({ index, state, x, y }, i) => (
            <GraphVisualisationLabel
              {...state}
              isVisible={!labelPositionShifts.length || state.isVisible}
              key={index}
              x={x + (labelPositionShifts[i]?.x || 0)}
              y={y + (labelPositionShifts[i]?.y || 0)}
            >
              {index}
            </GraphVisualisationLabel>
          ))}
        </motion.g>
      </Box>
    </Box>
  );
};

export default GraphVisualisation;
