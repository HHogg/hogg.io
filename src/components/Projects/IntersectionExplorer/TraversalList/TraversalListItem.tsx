import { motion } from 'framer-motion';
import { Appear, Box, Icon, Label, Link } from 'preshape';
import React, { Fragment, useContext } from 'react';
import { IntersectionExplorerContext } from '../IntersectionExplorer';
import { Traversal } from '../useGraph';
import TraversalTooltip from './TraversalTooltip';

interface Props {
  onPointerOver: () => void;
  traversal: Traversal;
}

const TraversalListItem: React.FunctionComponent<Props> = ({ onPointerOver, traversal }) => {
  const { bitset, index, path } = traversal;
  const { activeNodeIndex, activeTraversalIndex, removeTraversal } = useContext(IntersectionExplorerContext);
  const isTraversalActive = activeTraversalIndex === index || bitset.get(activeNodeIndex) === 1;
  const nodesInPath = path.filter((_, i) => i % 2 === 0);

  const isFocused = (activeNodeIndex === -1 && activeTraversalIndex === -1) || isTraversalActive;

  const handlePointerOver = (event: React.PointerEvent) => {
    event.stopPropagation();
    onPointerOver();
  };

  return (
    <Appear animation="Pop" margin="x2">
      <motion.div
          animate={ {
            opacity: isFocused ? 1 : 0.25,
            scale: isFocused ? 1 : 0.95,
          } }
          initial={ {
            opacity: 0,
            scale: 1,
          } }
          transition={ {
            delay: 10 / 1000,
          } }>
        <TraversalTooltip
            traversal={ traversal }
            visible={ activeTraversalIndex === index }>
          { (props) => (
            <Label { ...props }
                alignChildrenVertical="middle"
                flex="horizontal"
                gap="x2"
                onPointerOver={ handlePointerOver }
                size="x1">
              <Box>
                { nodesInPath
                    .slice(0, -1)
                    .map((c, i, { length }) => (
                      <Fragment key={ i }>
                        <motion.span
                            animate={ {
                              opacity: !isFocused || activeNodeIndex === -1 || +c === activeNodeIndex ? 1 : 0.25,
                              scale: !isFocused || activeNodeIndex === -1 || +c === activeNodeIndex ? 1 : 0.95,
                            } }
                            initial={ {
                              opacity: 0,
                              scale: 1,
                            } }>
                          { c }
                        </motion.span>

                        <motion.span
                            animate={ {
                              opacity: !isFocused || activeNodeIndex === -1 ? 1 : 0.25,
                              scale: !isFocused || activeNodeIndex === -1 ? 1 : 0.95,
                            } }
                            initial={ {
                              opacity: 0,
                              scale: 1,
                            } }>
                          { i < length - 1 && ' > ' }
                        </motion.span>
                      </Fragment>
                    ))
                }
              </Box>

              <Box>
                <Link onClick={ () => removeTraversal(traversal.index) }>
                  <Icon
                      name="Cross"
                      size="1rem" />
                </Link>
              </Box>
            </Label>
            ) }
        </TraversalTooltip>
      </motion.div>
    </Appear>
  );
};

export default TraversalListItem;
