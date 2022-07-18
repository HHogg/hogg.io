import classNames from 'classnames';
import { motion } from 'framer-motion';
import { transitionTimeSlow, transitionTimingFunction } from 'preshape';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { NodeState } from '../useGraph';

interface Props extends Partial<NodeState> {
  animate?: boolean;
  d: string;
}

const transition = {
  duration: transitionTimeSlow / 1000,
  timingFunction: transitionTimingFunction,
};

const GraphVisualisationEdge = (props: Props) => {
  const { animate, d, isPrevious, isNext, isValid } = props;

  const refPath = useRef<SVGPathElement>(null);
  const [length, setLength] = useState(0);
  const classes = classNames('Graph__edge', {
    'Graph__edge--previous': isPrevious,
    'Graph__edge--next': isNext,
    'Graph__edge--valid': isValid && isValid[0] === true,
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
