import classNames from 'classnames';
import { motion } from 'framer-motion';
import { transitionTimingFunction } from 'preshape';
import { useLayoutEffect, useRef, useState } from 'react';
import { Edge, Node } from '../../useGraph';
import useIntersectionExplorerContext from '../useIntersectionExplorerContext';
import { getGraphEdgeTransitionDurationMs } from './getGraphEdgeTransitionDurationMs';

type Props = {
  animate?: boolean;
  d: string;
  node: Edge | Node;
};

const GraphEdge = ({ animate, d, node }: Props) => {
  const { speed } = useIntersectionExplorerContext();
  const refPath = useRef<SVGPathElement>(null);
  const [length, setLength] = useState(0);
  const classes = classNames('Graph__edge', {
    'Graph__edge--previous': node.state.isPrevious,
    'Graph__edge--next': node.state.isNext,
    'Graph__edge--valid': node.state.isValid && node.state.isValid[0] === true,
  });

  const transition = {
    duration: getGraphEdgeTransitionDurationMs(speed) / 1000,
    timingFunction: transitionTimingFunction,
  };

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

export default GraphEdge;
