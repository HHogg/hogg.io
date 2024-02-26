import classNames from 'classnames';
import { SVGAttributes, forwardRef } from 'react';
import { Edge, Node } from '../../useGraph';
import useIntersectionExplorerContext from '../useIntersectionExplorerContext';

type Props = SVGAttributes<SVGGElement> & {
  node: Node | Edge;
  strokeWidth?: number;
  x: number;
  y: number;
};

const GraphNode = forwardRef<SVGGElement, Props>(function GraphNodeInner(
  props,
  ref
) {
  const { node, strokeWidth = 1, x, y, ...rest } = props;
  const { state } = node;
  const {
    isCurrent,
    isNext,
    isPrevious,
    isValid: [isValid] = [],
    isVisible,
    isSelectable,
  } = state;

  const { activeNodeIndex } = useIntersectionExplorerContext();
  const isFocused = activeNodeIndex === node.index;

  const classes = classNames('Graph__node', {
    'Graph__node--connected': isNext,
    'Graph__node--focused': isFocused,
    'Graph__node--invalid': isValid === false,
    'Graph__node--selectable': isSelectable,
    'Graph__node--selected': isCurrent,
    'Graph__node--traversed': isPrevious,
    'Graph__node--valid': isValid === true,
  });

  return (
    <g
      {...rest}
      className={classes}
      data-visible={isVisible}
      ref={ref}
      style={{ strokeWidth }}
    >
      <circle
        className="Graph__node-point"
        cx={x}
        cy={y}
        style={{ transformOrigin: `${x}px ${y}px` }}
      />

      <circle
        className="Graph__node-hit"
        cx={x}
        cy={y}
        style={{ transformOrigin: `${x}px ${y}px` }}
      />
    </g>
  );
});

export default GraphNode;
