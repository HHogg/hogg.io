import { Circle, Graph } from '@hogg/circle-intersections';
import classNames from 'classnames';
import { Box, BoxProps } from 'preshape';
import { TouchEvent, MouseEvent, Ref } from 'react';
import EditorCircle from './EditorCircle';
import EditorIntersection from './EditorIntersection';
import './Editor.css';
import { CircleArtData } from './EditorProvider';

export type Mode = 'draw' | 'fill' | 'view';

type Props = BoxProps & {
  activeCircle?: Circle | null;
  fills: CircleArtData['fills'];
  graph: Graph;
  mode: Mode;
  width: number;
  height: number;
  refContainer?: Ref<SVGSVGElement>;
  refCirclesContainer?: Ref<SVGGElement>;
  onIntersectionClick?: (bitset: string) => void;
  onMouseDown?: (e: MouseEvent) => void;
  onTouchMove?: (e: TouchEvent) => void;
  onTouchStart?: (e: TouchEvent) => void;
};

export default function EditorViewer({
  activeCircle,
  fills,
  graph,
  mode,
  height,
  width,
  refContainer,
  refCirclesContainer,
  onIntersectionClick,
  onMouseDown,
  onTouchMove,
  onTouchStart,
  ...rest
}: Props) {
  const classes = classNames('CircleArt', `CircleArt--mode-${mode}`);

  return (
    <Box
      {...rest}
      className={classes}
      basis="0"
      container
      grow
      overflow="hidden"
    >
      <Box
        absolute="center"
        height="100%"
        onMouseDown={onMouseDown}
        onTouchMove={onTouchMove}
        onTouchStart={onTouchStart}
        preserveAspectRatio="xMidYMid meet"
        ref={refContainer}
        tag="svg"
        viewBox={`0 0 ${width} ${height}`}
        textColor="background-shade-1"
      >
        {mode === 'draw' && (
          <g ref={refCirclesContainer}>
            {graph.circles
              .sort((a, b) => b.radius - a.radius)
              .map(({ id, radius, x, y }) => (
                <EditorCircle
                  active={activeCircle?.id === id}
                  id={id}
                  key={id}
                  radius={radius}
                  x={x}
                  y={y}
                />
              ))}
          </g>
        )}

        {(mode === 'fill' || mode === 'view') && (
          <g>
            {graph.traversals.map((traversal) => (
              <EditorIntersection
                filled={fills[traversal.bitset.toString()]}
                graph={graph}
                key={traversal.bitset.toString()}
                onClick={
                  onIntersectionClick &&
                  (() => onIntersectionClick(traversal.bitset.toString()))
                }
                traversal={traversal}
              />
            ))}

            {graph.circles
              .filter((_, i) => graph.edges.every(({ circle }) => circle !== i))
              .map(({ id, radius, x, y }) => (
                <EditorCircle
                  active={activeCircle?.id === id}
                  filled={id ? fills[id] : undefined}
                  id={id}
                  key={id}
                  onClick={
                    onIntersectionClick && id
                      ? () => onIntersectionClick(id)
                      : undefined
                  }
                  radius={radius}
                  x={x}
                  y={y}
                />
              ))}
          </g>
        )}
      </Box>
    </Box>
  );
}
