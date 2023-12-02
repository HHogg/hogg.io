import { motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { Appear, Box, Label, Link } from 'preshape';
import { Fragment, FunctionComponent, PointerEvent } from 'react';
import { Traversal } from '../useGraph';
import useIntersectionExplorerContext from '../useIntersectionExplorerContext';
import TraversalTooltip from './TraversalTooltip';

interface Props {
  traversal: Traversal;
}

const TraversalListItem: FunctionComponent<Props> = ({ traversal }) => {
  const { bitset, index, path } = traversal;
  const {
    activeNodeIndex,
    activeTraversalIndex,
    removeTraversal,
    setActiveTraversalIndex,
  } = useIntersectionExplorerContext();
  const isTraversalActive =
    activeTraversalIndex === index || bitset.get(activeNodeIndex) === 1;
  const nodesInPath = path.filter((_, i) => i % 2 === 0);

  const isFocused =
    (activeNodeIndex === -1 && activeTraversalIndex === -1) ||
    isTraversalActive;

  const handlePointerOver = (event: PointerEvent) => {
    event.stopPropagation();
    setActiveTraversalIndex(traversal.index);
  };

  return (
    <Appear animation="Pop">
      <motion.div
        animate={{
          opacity: isFocused ? 1 : 0.25,
          scale: isFocused ? 1 : 0.95,
        }}
        initial={{
          opacity: 0,
          scale: 1,
        }}
        transition={{
          delay: 10 / 1000,
        }}
      >
        <TraversalTooltip traversal={traversal}>
          <Label
            alignChildrenVertical="middle"
            flex="horizontal"
            gap="x2"
            onPointerOver={handlePointerOver}
            size="x2"
          >
            <Box>
              {nodesInPath.slice(0, -1).map((c, i, { length }) => (
                <Fragment key={i}>
                  <motion.span
                    animate={{
                      opacity:
                        !isFocused ||
                        activeNodeIndex === -1 ||
                        +c === activeNodeIndex
                          ? 1
                          : 0.25,
                      scale:
                        !isFocused ||
                        activeNodeIndex === -1 ||
                        +c === activeNodeIndex
                          ? 1
                          : 0.95,
                    }}
                    initial={{
                      opacity: 0,
                      scale: 1,
                    }}
                  >
                    {c}
                  </motion.span>

                  <motion.span
                    animate={{
                      opacity: !isFocused || activeNodeIndex === -1 ? 1 : 0.25,
                      scale: !isFocused || activeNodeIndex === -1 ? 1 : 0.95,
                    }}
                    initial={{
                      opacity: 0,
                      scale: 1,
                    }}
                  >
                    {i < length - 1 && ' > '}
                  </motion.span>
                </Fragment>
              ))}
            </Box>

            <Box>
              <Link onClick={() => removeTraversal(traversal.index)}>
                <XIcon size="1rem" />
              </Link>
            </Box>
          </Label>
        </TraversalTooltip>
      </motion.div>
    </Appear>
  );
};

export default TraversalListItem;
