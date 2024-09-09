import { SvgLabelsProvider } from '@hogg/common';
import classNames from 'classnames';
import { Box, Motion, MotionsProps, useResizeObserver } from 'preshape';
import { useMemo, PointerEvent } from 'react';
import { Circle, Edge, Node } from '../..';
import getArcPath from '../../utils/getArcPath';
import getTraversalPath from '../../utils/getTraversalPath';
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

const getOppositeX = (circles: Circle[], node: Node | Edge) => {
  if ('circle' in node) {
    return circles[node.circle].x;
  }

  const c1 = circles[node.circles[0]];
  const c2 = circles[node.circles[1]];

  return c1.x + (c2.x - c1.x) / 2;
};

const getOppositeY = (circles: Circle[], node: Node | Edge) => {
  if ('circle' in node) {
    return circles[node.circle].y;
  }

  const c1 = circles[node.circles[0]];
  const c2 = circles[node.circles[1]];

  return c1.y + (c2.y - c1.y) / 2;
};

const GraphRenderer = (props: MotionsProps) => {
  const {
    activeNodeIndex,
    addToTraversal,
    setActiveNodeIndex,
    setActiveTraversalIndex,
    graph,
  } = useIntersectionExplorerContext();
  const [size, ref] = useResizeObserver();

  const padding = 30;
  const minDimension = Math.min(size.height, size.width);
  const width = minDimension + padding * 2;
  const height = minDimension + padding * 2;

  const circles = useMemo(
    () => getScaledProps(graph.circles, minDimension),
    [graph, minDimension]
  );
  const edges = useMemo(
    () => getScaledProps(graph.edges, minDimension),
    [graph, minDimension]
  );
  const nodes = useMemo(
    () => getScaledProps(graph.nodes, minDimension),
    [graph, minDimension]
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
        <SvgLabelsProvider width={width} height={height}>
          <Box
            tag="svg"
            absolute="center"
            className={classes}
            height={minDimension}
            width={minDimension}
            viewBox={`${width * -0.5} ${height * -0.5} ${width} ${height}`}
            style={{
              shapeRendering: 'geometricPrecision',
            }}
          >
            <GraphBounds height={height} width={width} />

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
              {[...nodes, ...edges].map((node) => (
                <GraphLabel
                  index={node.index}
                  isVisible={node.state.isVisible}
                  key={node.index}
                  text={node.index.toString()}
                  x={node.x}
                  y={node.y}
                  oppositeX={getOppositeX(circles, node)}
                  oppositeY={getOppositeY(circles, node)}
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
