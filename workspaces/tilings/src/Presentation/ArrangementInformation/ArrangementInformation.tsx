import { CopyToClipboardCard, DeepPartial } from '@hogg/common';
import { ColorMode, ColorPalette, Options, ScaleMode } from '@hogg/wasm';
import { Box, BoxProps, Grid, Text } from 'preshape';
import { expandNotationBlock } from '../Arrangement/utils';
import { useNotationContext } from '../Notation/useNotationContext';
import { usePlayerContext } from '../Player/usePlayerContext';
import ArrangementCard from './ArrangementCard';
import TransformCard from './TransformCard';

const parseEdgeType = (shapeType: string) =>
  expandNotationBlock(shapeType).join('-');

const parseShapeType = (shapeType: string) => {
  const expanded = expandNotationBlock(shapeType);
  return `${expanded.length}-${expanded.join(',')}`;
};

const parseVertexType = (vertexType: string) => {
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

  return vertexToNotation[vertexType];
};

const options: DeepPartial<Options> = {
  colorMode: ColorMode.Placement,
  colorPalette: ColorPalette.None,
  scaleMode: ScaleMode.Contain,
};

const Section = ({ children, title, ...rest }: BoxProps) => (
  <Box {...rest}>
    <Text margin="x4" weight="x4">
      {title}
    </Text>
    {children}
  </Box>
);

export default function ArrangementInformation() {
  const { path, transforms } = useNotationContext();
  const { renderResult } = usePlayerContext();
  const {
    notation = '',
    hash,
    vertexTypes = [],
    edgeTypes = [],
    shapeTypes = [],
  } = renderResult ?? {};

  return (
    <Box flex="vertical" gap="x8">
      {renderResult && (
        <>
          <Section title="Notation">
            <CopyToClipboardCard text={notation} size="x3" />
          </Section>

          {hash && (
            <Section title="Hash">
              <CopyToClipboardCard text={hash} size="x3" />
            </Section>
          )}
        </>
      )}

      <Section title={transforms.length ? 'Transforms' : 'No transforms'}>
        <Box flex="horizontal" gap="x16">
          {transforms.map((transform, index) => (
            <TransformCard
              uid={`transform/${index}`}
              key={transform}
              path={path}
              transform={transform}
              height={160}
            />
          ))}
        </Box>
      </Section>

      <Section title={vertexTypes.length ? 'Vertex types' : 'No vertex types'}>
        <Grid repeatWidth="80px" gap="x4">
          {vertexTypes.map((vertexType, index) => (
            <ArrangementCard
              uid={`vertexType/${index}`}
              label={vertexType}
              key={vertexType}
              notation={parseVertexType(vertexType)}
              size={80}
              options={options}
            />
          ))}
        </Grid>
      </Section>

      <Section title={edgeTypes.length ? 'Edge types' : 'No edge types'}>
        <Grid repeatWidth="80px" gap="x4">
          {edgeTypes.map((edgeType, index) => (
            <ArrangementCard
              uid={`edgeType/${index}`}
              label={edgeType}
              key={edgeType}
              notation={parseEdgeType(edgeType)}
              size={80}
              options={options}
            />
          ))}
        </Grid>
      </Section>

      <Section title={shapeTypes.length ? 'Shape types' : 'No shape types'}>
        <Grid repeatWidth="80px" gap="x4">
          {shapeTypes.map((shapeType, index) => (
            <ArrangementCard
              uid={`shapeType/${index}`}
              label={shapeType}
              key={shapeType}
              notation={parseShapeType(shapeType)}
              size={80}
              options={options}
            />
          ))}
        </Grid>
      </Section>
    </Box>
  );
}
