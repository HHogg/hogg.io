import { useMemo } from 'react';
import { expandNotationBlock } from '../Arrangement/utils';
import ArrangementCard, { ArrangementCardProps } from './ArrangementCard';

const parseShapeType = (shapeType: string) => {
  const expanded = expandNotationBlock(shapeType);
  return `${expanded.length}-${expanded.join(',')}`;
};

type Props = Omit<ArrangementCardProps, 'label' | 'notation'> & {
  shapeType: string;
};

export default function ShapeType({ shapeType, ...rest }: Props) {
  const notation = useMemo(() => parseShapeType(shapeType), [shapeType]);
  return <ArrangementCard {...rest} label={shapeType} notation={notation} />;
}
