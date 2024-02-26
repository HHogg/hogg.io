import { PropsWithChildren } from 'react';
import { Edge, Node } from '../../useGraph';
import useIntersectionExplorerContext from '../useIntersectionExplorerContext';
import NodeTooltipContentCurrent from './NodeTooltipContentCurrent';
import NodeTooltipContentNext from './NodeTooltipContentNext';
import NodeTooltipContentNoStart from './NodeTooltipContentNoStart';
import NodeTooltipContentPrevious from './NodeTooltipContentPrevious';
import NodeTooltipContentStart from './NodeTooltipContentStart';

type Props = {
  node: Node | Edge;
};

const NodeTooltipContent = (props: PropsWithChildren<Props>) => {
  const { node } = props;
  const { isTraversing } = useIntersectionExplorerContext();

  if (!isTraversing && node.state.isValid[0] === null)
    return <NodeTooltipContentNoStart node={node} />;
  if (!isTraversing && node.state.isValid[0] === true)
    return <NodeTooltipContentStart node={node} />;
  if (node.state.isCurrent) return <NodeTooltipContentCurrent node={node} />;
  if (node.state.isNext) return <NodeTooltipContentNext node={node} />;
  if (node.state.isPrevious) return <NodeTooltipContentPrevious node={node} />;

  return null;
};

export default NodeTooltipContent;
