import classNames from 'classnames';
import { motion } from 'framer-motion';
import { Box, useResizeObserver } from 'preshape';
import React, { useContext, useMemo, useRef } from 'react';
import { IntersectionExplorerContext } from '../IntersectionExplorer';
import { Edge, Node, Traversal } from '../useGraph';
import GraphVisualisationEdge from './GraphVisualisationEdge';
import GraphVisualisationLabel from './GraphVisualisationLabel';
import GraphVisualisationNode from './GraphVisualisationNode';
import GraphVisualisationTraversal from './GraphVisualisationTraversal';
import useLabelPositionShifts from './useLabelPositionShifts';
import './GraphVisualisation.css';

const scale = (v: number, m: number) => m * (v / 1);

// eslint-disable-next-line @typescript-eslint/ban-types
const scaleProps = <T extends {}>(entities: T[], props: (keyof T)[], range: number): T[] => {
  return entities.map((entity) => {
    const entityScaled: T = { ...entity };

    for (const prop of props) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      entityScaled[prop] = scale(entityScaled[prop] as unknown as number, range) as any;
    }

    return entityScaled;
  });
};


const getArcPath = (edge: Edge, nodes: Node[], start = true, reverse = false): string => {
  const { angleStart, angleEnd, nodes: [a, b], radius } = edge;
  const { x: sx, y: sy } = reverse ? nodes[b] : nodes[a];
  const { x: ex, y: ey } = reverse ? nodes[a] : nodes[b];

  const largeArcFlag = Math.abs(angleEnd - angleStart) >= Math.PI ? 1 : 0;
  const sweepFlag = reverse ? 0 : 1;

  return (start ? `M ${sx} ${sy} ` : '') +
    `A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${ex} ${ey} `;
};

const getTraversalPath = (traversal: Traversal, nodes: Node[], edges: Edge[]): string => {
  let path = '';

  for (let i = 1; i < traversal.path.length; i += 2) {
    const e = traversal.path[i] - nodes.length;
    const a = traversal.path[i - 1];
    const reverse = edges[e].nodes[0] !== a;

    path += getArcPath(
      edges[traversal.path[i] - nodes.length],
      nodes,
      i === 1,
      reverse,
    ) + ' ';
  }

  return path;
};


interface Props {
  onNodeOver: (index: number) => void;
  onTraversalOver: (index: number) => void;
}

const GraphVisualisation = ({ onNodeOver, onTraversalOver }: Props) => {
  const { activeNodeIndex, addToTraversal, graph, traversals } = useContext(IntersectionExplorerContext);
  const [size, ref] = useResizeObserver();
  const min = size.width;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const circles = useMemo(() => scaleProps(graph.circles, ['radius', 'x', 'y'], min), [min]);
  const edges = useMemo(() => scaleProps(graph.edges, ['radius', 'x', 'y'], min), [graph, min]);
  const nodes = useMemo(() => scaleProps(graph.nodes, ['x', 'y'], min), [graph, min]);
  const classes = classNames('GraphVisualisation', {
    'GraphVisualisation--has-active-node': activeNodeIndex > -1,
  });

  const refLabels = useRef<SVGGElement>(null);
  const refObstacles = useRef<SVGGElement>(null);
  const labelPositionShifts = useLabelPositionShifts({ circles, edges, nodes },
    refLabels.current,
    refObstacles.current);

  const handleNodeClick = (index: number) => () => {
    addToTraversal(index);
    onNodeOver(-1);
  };

  const handleNodeOver = (index: number) => (event: React.PointerEvent) => {
    event.stopPropagation();
    onTraversalOver(-1);
    onNodeOver(index);
  };

  const handleTraversalOver = (index: number) => (event: React.PointerEvent) => {
    event.stopPropagation();
    onNodeOver(-1);
    onTraversalOver(index);
  };

  return (
    <Box
        container
        height={ size.width }
        ref={ ref }>
      <Box
          absolute="center"
          className={ classes }
          height={ min }
          tag="svg"
          viewBox={ `${-min / 2} ${-min / 2} ${min} ${min}` }
          width={ min }>
        <g data-group-description="Arcs">
          { /* Dark template edges */ }
          { edges.map((edge) => (
            <GraphVisualisationEdge
                d={ getArcPath(edge, nodes) }
                key={ edge.index } />
          )) }

          { /* Animating yellow traversals */ }
          { traversals.map((traversal, index) => (
            <GraphVisualisationTraversal
                d={ getTraversalPath(traversal, nodes, edges) }
                index={ index }
                key={ index }
                onPointerOver={ traversal.isComplete ? handleTraversalOver(index) : undefined }
                traversal={ traversal }/>
          )) }
        </g>

        <g data-group-description="Label Links">
          { [...nodes, ...edges].map(({ index, state, x, y }, i) => (
            <motion.line
                animate={ {
                opacity: state.isVisible ? 1 : 0,
                x1: x,
                x2: x + (labelPositionShifts[i]?.x || 0) - (labelPositionShifts[i]?.dx || 0),
                y1: y,
                y2: y + (labelPositionShifts[i]?.y || 0) - (labelPositionShifts[i]?.dy || 0),
              } }
                key={ index }
                stroke="currentColor"
                strokeDasharray="3 3"
                strokeWidth="2" />
          )) }
        </g>

        <g data-group-description="Obstacles" ref={ refObstacles }>
          { [...nodes, ...edges].map(({ index, state, x, y }, i) => (
            <GraphVisualisationNode { ...state }
                isFocused={ activeNodeIndex === index }
                key={ index }
                n={ i }
                onClick={ state.isSelectable ? handleNodeClick(index) : undefined }
                onPointerOver={ handleNodeOver(index) }
                r={ 6 }
                x={ x }
                y={ y } />
          )) }
        </g>

        <motion.g
            animate={ { opacity: labelPositionShifts.length ? 1 : 0 } }
            data-group-description="Labels"
            ref={ refLabels }>
          { [...nodes, ...edges].map(({ index, state, x, y }, i) => (
            <GraphVisualisationLabel { ...state }
                isVisible={ !labelPositionShifts.length || state.isVisible }
                key={ index }
                x={ x + (labelPositionShifts[i]?.x || 0) }
                y={ y + (labelPositionShifts[i]?.y || 0) }>
              { index }
            </GraphVisualisationLabel>
          )) }
        </motion.g>
      </Box>
    </Box>
  );
};

export default GraphVisualisation;
