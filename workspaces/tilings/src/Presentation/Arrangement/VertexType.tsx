import { PatternBackground } from '@hogg/common';
import { Box, Text } from 'preshape';
import TilingRenderer, { TilingRendererProps } from '../../TilingRenderer';
import { Options } from '../../types';

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

type Props = {
  vertexType: string;
};

const options: Partial<Options> = {};

export default function VertexType({
  vertexType,
  ...rest
}: Omit<TilingRendererProps, 'notation'> & Props) {
  return (
    <Box flex="vertical" alignChildren="middle" gap="x2">
      <PatternBackground
        padding="x2"
        backgroundColor="background-shade-2"
        borderRadius="x2"
        borderSize="x1"
        borderColor="background-shade-4"
        width="100%"
      >
        <TilingRenderer
          {...rest}
          notation={vertexToNotation[vertexType]}
          options={options}
        />
      </PatternBackground>

      <Text size="x3" weight="x2">
        {vertexType}
      </Text>
    </Box>
  );
}
