import { DeepPartial } from '@hogg/common';
import { Layer, Options } from '@hogg/wasm';
import { TilingRendererProps } from '../../TilingRenderer';
import ArrangementCard from './ArrangementCard';

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
  transform,
  ...rest
}: Omit<TilingRendererProps, 'notation'> & Props) {
  return (
    <ArrangementCard
      {...rest}
      label={transform}
      notation={`${path}/${transform}`}
      options={options}
    />
  );
}
