import { BoxProps, Text } from 'preshape';
import { formatUniform } from '../utils/formatting';
import { resultsByNotation } from '../utils/results';

type Props = {
  notation: string;
  withGomJauHogg?: boolean;
  withCundyRollett?: boolean;
  withUniform?: boolean;
  withUniqueKey?: boolean;
};

export default function TilingInformation(props: BoxProps & Props) {
  const {
    notation,
    withGomJauHogg = false,
    withCundyRollett = false,
    withUniform = false,
    withUniqueKey = false,
    ...rest
  } = props;
  const information = resultsByNotation[notation];
  const withLabels =
    +withGomJauHogg + +withCundyRollett + +withUniform + +withUniqueKey > 1;

  return (
    <Text {...rest} padding="x2" paddingVertical="x3" size="x2">
      <Text
        align="middle"
        alignChildren="middle"
        flex="horizontal"
        gap="x2"
        wrap
      >
        {withGomJauHogg && (
          <Text shrink>
            {withLabels && 'GomJau-Hogg '}
            <Text weight="x2" tag="span" breakOn="all">
              {notation}
            </Text>
          </Text>
        )}

        {withCundyRollett && (
          <Text shrink>
            {withLabels && 'Cundy & Rollett '}
            <Text weight="x2" tag="span" breakOn="all">
              {information.vertex}
            </Text>
          </Text>
        )}

        {withUniform && (
          <Text shrink>
            {withLabels && 'Uniform '}
            <Text weight="x2" tag="span" breakOn="all">
              {formatUniform(information.uniform)}
            </Text>
          </Text>
        )}

        {withUniqueKey && (
          <Text shrink>
            {withLabels && 'Unique Key '}
            <Text weight="x2" tag="span" breakOn="all">
              {information.d_key}
            </Text>
          </Text>
        )}
      </Text>
    </Text>
  );
}
