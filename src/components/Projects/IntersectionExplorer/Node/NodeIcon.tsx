import { sizeX6Px, sizeX8Px } from 'preshape';
import GraphVisualisationEdge from '../GraphVisualisation/GraphVisualisationEdge';
import GraphVisualisationNode from '../GraphVisualisation/GraphVisualisationNode';
import { Edge, Node, NodeState } from '../useGraph';
import useIntersectionExplorerContext from '../useIntersectionExplorerContext';

type Props = {
  node: Node | Edge;
};

const SIZE = 6 * 2;

const PATH_DOWN = `
  M ${SIZE / 2} ${SIZE / 2}
  L ${SIZE / 2} ${SIZE * 3}`;

const PATH_LEFT_AND_UP = `
  M ${SIZE / 2} ${SIZE / 2}
  L ${SIZE / 2 - sizeX8Px} ${SIZE / 2}
  L ${SIZE / 2 - sizeX8Px} ${SIZE / 2 - sizeX6Px}`;

const getEdgePath = (state: NodeState, isTraversing?: boolean): string => {
  if (state.isCurrent || !isTraversing) return '';
  if (state.isPrevious) return PATH_DOWN;
  if (state.isNext) return PATH_LEFT_AND_UP;

  return '';
};

const NodeIcon = (props: Props) => {
  const { node } = props;
  const { isTraversing } = useIntersectionExplorerContext();

  return (
    <svg height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE}>
      <GraphVisualisationEdge
        animate
        node={node}
        d={getEdgePath(node.state, isTraversing)}
      />

      <GraphVisualisationNode node={node} x={SIZE / 2} y={SIZE / 2} />
    </svg>
  );
};

export default NodeIcon;
