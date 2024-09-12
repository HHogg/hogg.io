import { useMemo } from 'react';
import { TilingRendererProps } from '../../TilingRenderer';
import { expandNotationBlock } from '../Arrangement/utils';
import ArrangementCard from './ArrangementCard';

const parseEdgeType = (shapeType: string) =>
  expandNotationBlock(shapeType).join('-');

type Props = {
  edgeType: string;
};

export default function EdgeType({
  edgeType,
  ...rest
}: Omit<TilingRendererProps, 'notation'> & Props) {
  return (
    <ArrangementCard
      {...rest}
      label={edgeType}
      notation={useMemo(() => parseEdgeType(edgeType), [edgeType])}
    />
  );
}
