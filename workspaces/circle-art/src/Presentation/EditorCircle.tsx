import { Circle } from '@hogg/circle-intersections';
import classNames from 'classnames';
import { Box } from 'preshape';

type Props = Circle & {
  active?: boolean;
  filled?: boolean;
  onClick?: () => void;
};

const EditorCircle = ({ active, filled, id, onClick, radius, x, y }: Props) => {
  const classes = classNames('CircleArt__circle', {
    'CircleArt__circle--active': active,
    'CircleArt__circle--filled-fg': filled === true,
    'CircleArt__circle--filled-bg': filled === false,
    'CircleArt__circle--selectable': onClick,
  });

  return (
    <Box
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
