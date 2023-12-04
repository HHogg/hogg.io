import classNames from 'classnames';
import { motion } from 'framer-motion';
import { Box, Motion, MotionsProps, useResizeObserver } from 'preshape';
import { useMemo, useRef, PointerEvent } from 'react';
import NodeTooltip from '../NodeTooltip/NodeTooltip';
import useIntersectionExplorerContext from '../useIntersectionExplorerContext';
import GraphEdge from './GraphEdge';
import GraphLabel from './GraphLabel';
import GraphNode from './GraphNode';
import GraphTraversal from './GraphTraversal';
import getArcPath from './getArcPath';
import getScaledProps from './getScaledProps';
import getTraversalPath from './getTraversalPath';
import useLabelPositionShifts from './useLabelPositionShifts';
import './GraphRenderer.css';

const GraphRenderer = (props: MotionsProps) => {
  const {
    activeNodeIndex,
    addToTraversal,
    setActiveNodeIndex,
    setActiveTraversalIndex,
    graph,
  } = useIntersectionExplorerContext();
  const [size, ref] = useResizeObserver();
  const min = Math.min(size.height, size.width);

  const circles = useMemo(
    () => getScaledProps(graph.circles, ['radius', 'x', 'y'], min),
    [graph, min]
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

  const handleNodeClick = (index: number) => {
    addToTraversal(index);
    setActiveNodeIndex(-1);
  };

  const handleNodePointerOver = (index: number) => (event: PointerEvent) => {
    event.stopPropagation();
    setActiveTraversalIndex(-1);
    setActiveNodeIndex(index);
  };

  return (
    <Motion {...props} layout flex="vertical" grow>
      <Box container grow ref={ref}>
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
              <GraphEdge
                d={getArcPath(edge, nodes)}
                key={edge.index}
                node={edge}
              />
            ))}

            {/* Animating yellow traversals */}
            {graph.traversals.map((traversal, index) => (
              <GraphTraversal
                d={getTraversalPath(traversal, nodes, edges)}
                index={index}
                key={index}
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
            {[...nodes, ...edges].map((node) => (
              <NodeTooltip node={node} key={node.index}>
                <GraphNode
                  onClick={
                    node.state.isSelectable
                      ? () => handleNodeClick(node.index)
                      : undefined
                  }
                  onPointerOver={handleNodePointerOver(node.index)}
                  node={node}
                  strokeWidth={2}
                  x={node.x}
                  y={node.y}
                />
              </NodeTooltip>
            ))}
          </g>

          <motion.g
            animate={{ opacity: labelPositionShifts.length ? 1 : 0 }}
            data-group-description="Labels"
            ref={refLabels}
          >
            {[...nodes, ...edges].map(({ index, state, x, y }, i) => (
              <GraphLabel
                isVisible={!labelPositionShifts.length || state.isVisible}
                key={index}
                x={x + (labelPositionShifts[i]?.x || 0)}
                y={y + (labelPositionShifts[i]?.y || 0)}
              >
                {index}
              </GraphLabel>
            ))}
          </motion.g>
        </Box>
      </Box>
    </Motion>
  );
};

export default GraphRenderer;
