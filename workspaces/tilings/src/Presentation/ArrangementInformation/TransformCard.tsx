import { DeepPartial } from '@hogg/common';
import { Layer, Options } from '@hogg/wasm';
import { TilingRendererProps } from '../../TilingRenderer';
import useParsedTransform from '../Notation/useParsedTransform';
import ArrangementCard from './ArrangementCard';
import TransformLabel from './TransformLabel';

type Props = {
  path: string;
  transform: string;
};

const options: DeepPartial<Options> = {
  showTransformIndex: 0,
  showLayers: {
    [Layer.Transform]: true,
  },
};

export default function TransformCard({
  path,
  transform: transformString,
  ...rest
}: Omit<TilingRendererProps, 'notation'> & Props) {
  const transform = useParsedTransform(transformString);

  return (
    <ArrangementCard
      {...rest}
      label={transformString}
      notation={`${path}/${transformString}`}
      options={options}
      padding="x8"
      footer={transform ? <TransformLabel transform={transform} /> : undefined}
    />
  );
}
