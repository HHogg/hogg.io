import { Operation, OriginType } from '@hogg/wasm';
import { Text } from 'preshape';
import { formatOrdinal } from '../utils/formatting';
import useParsedTransform from './useParsedTransform';

type Props = {
  transform: string;
};

export default function TransformDescription({
  transform: transformString,
}: Props) {
  const transform = useParsedTransform(transformString);

  if (!transform) {
    return null;
  }

  if (transform.type === 'continuous') {
    if (transform.content.operation === Operation.Reflect) {
      return (
        <Text>
          Continuously mirror every {transform.content.value.value}° around the
          center
        </Text>
      );
    }

    if (transform.content.operation === Operation.Rotate) {
      return (
        <Text>
          Continuously rotate every {transform.content.value.value}° around the
          center
        </Text>
      );
    }
  }

  if (transform.type === 'eccentric') {
    const ordinal = formatOrdinal(transform.content.originIndex.value + 1);

    if (transform.content.operation === Operation.Reflect) {
      if (transform.content.originType === OriginType.CenterPoint) {
        return (
          <Text>
            Mirror once over a line perpendicular to the vector at the {ordinal}{' '}
            center point.
          </Text>
        );
      }

      if (transform.content.originType === OriginType.MidPoint) {
        return (
          <Text>
            Mirror once over the line segment for the {ordinal} mid point.
          </Text>
        );
      }

      if (transform.content.originType === OriginType.EndPoint) {
        return (
          <Text>
            Mirror once over a line perpendicular to the vector at the {ordinal}{' '}
            end point.
          </Text>
        );
      }
    }

    if (transform.content.operation === Operation.Rotate) {
      if (transform.content.originType === OriginType.CenterPoint) {
        return <Text>Rotate 180° around the {ordinal} center point.</Text>;
      }

      if (transform.content.originType === OriginType.MidPoint) {
        return <Text>Rotate 180° around the {ordinal} mid point.</Text>;
      }

      if (transform.content.originType === OriginType.EndPoint) {
        return <Text>Rotate 180° around the {ordinal} end point.</Text>;
      }
    }
  }

  return null;
}
