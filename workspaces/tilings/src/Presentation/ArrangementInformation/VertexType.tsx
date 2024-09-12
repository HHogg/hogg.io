import ArrangementCard, { ArrangementCardProps } from './ArrangementCard';

const vertexToNotation: Record<string, string> = {
  '3⁶': '3/m30',
  '4⁴': '4-4,4-0,4',
  '6³': '6-6,6',
  '3⁴.6': '6-3,3-0,3-3',
  '3³.4²': '3-3,4-0,3,4',
  '3².4.3.4': '4-3,3-4,3',
  '3².4.12': '12-4-0,3-0,3',
  '3.4.3.12': '12-3-4-0,0,3',
  '3².6²': '3-3,6-0,6',
  '3.6.3.6': '6-3,3-6',
  '3.4².6': '3-4-4-0,6',
  '3.4.6.4': '3-4,4-0,0,6',
  '3.12²': '3-12,12',
  '4.6.12': '4-6,12',
  '4.8²': '4-8,8',
};

type Props = Omit<ArrangementCardProps, 'label' | 'notation'> & {
  vertexType: string;
};

export default function VertexType({ vertexType, ...rest }: Props) {
  return (
    <ArrangementCard
      {...rest}
      label={vertexType}
      notation={vertexToNotation[vertexType]}
    />
  );
}
