import classNames from 'classnames';
import { Box } from 'preshape';
import React, { useContext } from 'react';
import { RootContext } from '../../../Root';
import getTraversalPath from '../../IntersectionExplorer/GraphVisualisation/getTraversalPath';
import { Graph, Traversal } from '../../IntersectionExplorer/useGraph';
import { getColors } from './Editor';

type Props = {
  filled?: boolean;
  graph: Graph;
  onClick?: () => void;
  traversal: Traversal;
};

const EditorIntersection = ({ filled, graph, onClick, traversal }: Props) => {
  const { theme } = useContext(RootContext);
  const classes = classNames('CircleArt__intersection', {
    'CircleArt__intersection--selectable': onClick,
  });

  const d = getTraversalPath(traversal, graph.nodes, graph.edges);

  return (
    <Box
      {...getColors(theme, filled)}
      className={classes}
      d={d}
      id={traversal.bitset.toString()}
      onClick={onClick}
      tag="path"
    />
  );
};

export default EditorIntersection;
