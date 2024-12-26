import { Operation, Transform } from '@hogg/wasm';
import { FlipHorizontalIcon, RotateCwIcon } from 'lucide-react';

type Props = {
  transform: Transform;
};

export default function TransformOperationIcon({ transform }: Props) {
  if (transform.type === 'continuous') {
    if (transform.content.operation === Operation.Rotate)
      return <RotateCwIcon />;
    if (transform.content.operation === Operation.Reflect)
      return <FlipHorizontalIcon />;

    throw new Error(`Unknown operation: ${transform.content.operation}`);
  }

  if (transform.type === 'eccentric') {
    if (transform.content.operation === Operation.Rotate)
      return <RotateCwIcon />;
    if (transform.content.operation === Operation.Reflect)
      return <FlipHorizontalIcon />;

    throw new Error(`Unknown operation: ${transform.content.operation}`);
  }

  throw new Error(`Unknown transform: ${transform}`);
}
