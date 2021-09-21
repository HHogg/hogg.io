import { sizeX4Px, sizeX6Px, sizeX8Px } from 'preshape';
import React from 'react';
import GraphVisualisationEdge from '../GraphVisualisation/GraphVisualisationEdge';
import GraphVisualisationNode from '../GraphVisualisation/GraphVisualisationNode';
import { NodeState } from '../useGraph';

interface Props extends NodeState {
  isFocused?: boolean;
  isTraversing?: boolean;
  onClick?: () => void;
  path?: 'left' | 'fromState';
  n: number;
}

const SIZE = sizeX4Px;

const PATH_LEFT = `
  M ${SIZE / 2} ${SIZE / 2}
  L ${SIZE / 2 - sizeX8Px} ${SIZE / 2}`;

const PATH_DOWN = `
  M ${SIZE / 2} ${SIZE / 2}
  L ${SIZE / 2} ${SIZE * 3}`;

const PATH_LEFT_AND_UP = `
  M ${SIZE / 2} ${SIZE / 2}
  L ${SIZE / 2 - sizeX8Px} ${SIZE / 2}
  L ${SIZE / 2 - sizeX8Px} ${SIZE / 2 - sizeX6Px}`;

const getEdgePath = (state: NodeState, path: Props['path'], isTraversing?: boolean): string => {
  if (state.isCurrent || !isTraversing) return '';
  if (path === 'left') return PATH_LEFT;
  if (state.isPrevious) return PATH_DOWN;
  if (state.isNext) return PATH_LEFT_AND_UP;

  return '';
} ;

const NodeIcon = (props: Props) => {
  const {
    isFocused,
    isTraversing,
    onClick,
    path = 'fromState',
    n,
    ...state
  } = props;

  return (
    <svg
        height={ SIZE }
        viewBox={ `0 0 ${SIZE} ${SIZE}` }
        width={ SIZE }>
      <GraphVisualisationEdge { ...state }
          animate
          d={ getEdgePath(state, path, isTraversing) } />

      <GraphVisualisationNode { ...state }
          isFocused={ isFocused }
          n={ n }
          onClick={ onClick }
          r={ SIZE / 2 }
          x={ SIZE / 2 }
          y={ SIZE / 2 } />
    </svg>
  );
};

export default NodeIcon;
