import classNames from 'classnames';
import { Box } from 'preshape';
import React, { useContext } from 'react';
import { RootContext } from '../../../Root';
import { Circle } from '../../IntersectionExplorer/useGraph';
import { getColors } from './Editor';

type Props = Circle & {
  active?: boolean;
  filled?: boolean;
  onClick?: () => void;
};

const EditorCircle = ({ active, filled, id, onClick, radius, x, y }: Props) => {
  const { theme } = useContext(RootContext);
  const classes = classNames('CircleArt__circle', {
    'CircleArt__circle--active': active,
    'CircleArt__circle--selectable': onClick,
  });

  return (
    <Box
      {...getColors(theme, filled)}
      className={classes}
      cx={x}
      cy={y}
      id={id}
      onClick={onClick}
      r={radius}
      tag="circle"
    />
  );
};

export default EditorCircle;
