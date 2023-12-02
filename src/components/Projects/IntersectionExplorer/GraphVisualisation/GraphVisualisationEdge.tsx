import classNames from 'classnames';
import { motion } from 'framer-motion';
import { transitionTimeSlow, transitionTimingFunction } from 'preshape';
import { useLayoutEffect, useRef, useState } from 'react';
import { Edge, Node } from '../useGraph';

type Props = {
  animate?: boolean;
  d: string;
  node: Edge | Node;
};

const transition = {
  duration: transitionTimeSlow / 1000,
  timingFunction: transitionTimingFunction,
};

const GraphVisualisationEdge = (props: Props) => {
  const { animate, d, node } = props;

  const refPath = useRef<SVGPathElement>(null);
  const [length, setLength] = useState(0);
  const classes = classNames('Graph__edge', {
    'Graph__edge--previous': node.state.isPrevious,
    'Graph__edge--next': node.state.isNext,
    'Graph__edge--valid': node.state.isValid && node.state.isValid[0] === true,
  });

  useLayoutEffect(() => {
    if (refPath.current) {
      setLength(refPath.current.getTotalLength());
    }
  }, [d]);

  return (
    <motion.path
      animate={{
        strokeDasharray: animate ? length : 0,
      }}
      className={classes}
      d={d}
      ref={refPath}
      strokeDasharray={0}
      strokeDashoffset={0}
      transition={transition}
    />
  );
};

export default GraphVisualisationEdge;
