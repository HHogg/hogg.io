import { SvgLabelsProvider } from '@hogg/common';
import classNames from 'classnames';
import { Box, Motion, MotionsProps, useResizeObserver } from 'preshape';
import { useMemo, PointerEvent } from 'react';
import { getArcPath, getTraversalPath } from '@hogg/circle-intersections';
import NodeTooltip from '../NodeTooltip/NodeTooltip';
import useIntersectionExplorerContext from '../useIntersectionExplorerContext';
import GraphBounds from './GraphBounds';
import GraphCircle from './GraphCircle';
import GraphEdge from './GraphEdge';
import GraphLabel from './GraphLabel';
import GraphNode from './GraphNode';
import GraphTraversal from './GraphTraversal';
import getScaledProps from './getScaledProps';
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
        <SvgLabelsProvider maxSearchRadius={200}>
          <Box
            absolute="center"
            className={classes}
            height={min}
            tag="svg"
            viewBox={`${-min / 2} ${-min / 2} ${min} ${min}`}
            width={min}
          >
            <GraphBounds height={size.height} width={size.width} />

            <g>
              {circles.map((circle, index) => (
                <GraphCircle key={index} circle={circle} />
              ))}
            </g>

            <g>
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

            <g>
              {[...nodes, ...edges].map(({ index, state, x, y }) => (
                <GraphLabel
                  isVisible={state.isVisible}
                  key={index}
                  text={index.toString()}
                  x={x}
                  y={y}
                />
              ))}
            </g>

            <g>
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
          </Box>
        </SvgLabelsProvider>
      </Box>
    </Motion>
  );
};

export default GraphRenderer;
