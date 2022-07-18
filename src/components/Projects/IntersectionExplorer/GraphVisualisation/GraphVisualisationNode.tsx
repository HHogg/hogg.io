import classNames from 'classnames';
import React, { SVGAttributes } from 'react';
import { NodeState } from '../useGraph';

interface Props extends NodeState, SVGAttributes<SVGGElement> {
  isFocused?: boolean;
  n: number;
  x: number;
  y: number;
}

const GraphVisualisationNode = (props: Props) => {
  const {
    isCurrent,
    isFocused,
    isNext,
    isPrevious,
    isValid: [isValid] = [],
    isVisible,
    isSelectable,
    x,
    y,
    ...rest
  } = props;

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
    <g {...rest} className={classes} data-visible={isVisible}>
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
};

export default GraphVisualisationNode;
