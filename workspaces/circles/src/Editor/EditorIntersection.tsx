import classNames from 'classnames';
import { Box } from 'preshape';
import getTraversalPath from '../IntersectionExplorer/GraphRenderer/getTraversalPath';
import { Graph, Traversal } from '../useGraph';

type Props = {
  filled?: boolean;
  graph: Graph;
  onClick?: () => void;
  traversal: Traversal;
};

const EditorIntersection = ({ filled, graph, onClick, traversal }: Props) => {
  const classes = classNames('CircleArt__intersection', {
    'CircleArt__intersection--filled-fg': filled === true,
    'CircleArt__intersection--filled-bg': filled === false,
    'CircleArt__intersection--selectable': onClick,
  });

  const d = getTraversalPath(traversal, graph.nodes, graph.edges);

  return (
    <Box
      className={classes}
      d={d}
      id={traversal.bitset.toString()}
      onClick={onClick}
      tag="path"
    />
  );
};

export default EditorIntersection;
