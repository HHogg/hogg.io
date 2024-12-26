import { Transform } from '@hogg/wasm';
import { BoxProps } from 'preshape';
import TransformLabelContentContinuous from './TransformLabelContentContinuous';
import TransformLabelContentEccentric from './TransformLabelContentEccentric';

type Props = {
  transform: Transform;
};

export default function TransformLabel({
  transform,
}: Omit<BoxProps, 'transform'> & Props) {
  if (transform.type === 'continuous') {
    return (
      <TransformLabelContentContinuous
        transform={transform}
        transformContinuous={transform.content}
      />
    );
  }

  if (transform.type === 'eccentric') {
    return (
      <TransformLabelContentEccentric
        transform={transform}
        transformEccentric={transform.content}
      />
    );
  }

  return null;
}
