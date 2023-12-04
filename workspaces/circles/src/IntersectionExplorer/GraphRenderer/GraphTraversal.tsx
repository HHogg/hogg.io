import classNames from 'classnames';
import { motion, SVGMotionProps } from 'framer-motion';
import {
  transitionTimeFast,
  transitionTimeSlow,
  transitionTimingFunction,
} from 'preshape';
import { useLayoutEffect, useRef, useState, PointerEvent } from 'react';
import { NodeState, Traversal } from '../../useGraph';
import { getCurrentTraversal } from '../../useGraph/traversal';
import BitSetTooltip from '../TraversalList/BitSetTooltip';
import useIntersectionExplorerContext from '../useIntersectionExplorerContext';

interface Props extends Partial<NodeState> {
  index: number;
  d: string;
  traversal: Traversal;
}

const transition = {
  duration: transitionTimeSlow / 1000,
  timingFunction: transitionTimingFunction,
};

const GraphTraversal = (props: Props) => {
  const { d, index, traversal } = props;
  const {
    activeNodeIndex,
    activeTraversalIndex,
    graph,
    isTraversing,
    setActiveNodeIndex,
    setActiveTraversalIndex,
  } = useIntersectionExplorerContext();

  const currentTraversal = getCurrentTraversal(graph.traversals);
  const refGlow = useRef<SVGPathElement>(null);
  const refPath = useRef<SVGPathElement>(null);

  const isFocused =
    !currentTraversal &&
    ((activeNodeIndex === -1 && activeTraversalIndex === -1) ||
      traversal.bitset.get(activeNodeIndex) === 1 ||
      index === activeTraversalIndex);

  const classes = classNames('Graph__traversal', {
    'Graph__traversal--complete': traversal?.isComplete,
    'Graph__traversal--hide-fill': !isFocused,
    'Graph__traversal--hide-stroke': !!currentTraversal && traversal.isComplete,
  });

  const [[dist, length], setLength] = useState([0, 0]);
  const previousLength = useRef(0);

  const handlePointerOver = (event: PointerEvent) => {
    event.stopPropagation();
    setActiveNodeIndex(-1);
    setActiveTraversalIndex(index);
  };

  useLayoutEffect(() => {
    if (refPath.current && refGlow.current) {
      const length = refPath.current.getTotalLength();
      const dist = length - previousLength.current;

      setLength([dist, length]);

      previousLength.current = length;
    }
  }, [d]);

  const pathProps: SVGMotionProps<SVGPathElement> = {
    animate: {
      strokeDashoffset: 0,
    },
    initial: {
      strokeDashoffset: dist,
    },
    transition: transition,
  };

  return (
    <BitSetTooltip
      traversal={traversal}
      visible={isTraversing ? false : undefined}
    >
      <motion.g
        className={classes}
        key={length} /* 👀 ... you know what */
        onPointerOver={traversal.isComplete ? handlePointerOver : undefined}
        strokeDasharray={`${length} ${length}`}
        transition={{ ...transition, duration: transitionTimeFast / 1000 }}
      >
        <motion.path
          {...pathProps}
          className="Graph__traversal-path"
          d={d}
          ref={refPath}
        />

        <motion.path
          {...pathProps}
          className="Graph__traversal-hit"
          d={d}
          ref={refGlow}
        />
      </motion.g>
    </BitSetTooltip>
  );
};

export default GraphTraversal;
