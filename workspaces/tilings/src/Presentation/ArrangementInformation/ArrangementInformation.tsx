import { CopyToClipboardCard } from '@hogg/common';
import { Box, BoxProps, Grid, Text } from 'preshape';
import { useNotationContext } from '../Notation/useNotationContext';
import { usePlayerContext } from '../Player/usePlayerContext';
import EdgeType from './EdgeType';
import ShapeType from './ShapeType';
import TransformCard from './TransformCard';
import VertexType from './VertexType';

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
        </>
      )}

      <Section title={vertexTypes.length ? 'Vertex types' : 'No vertex types'}>
        <Grid repeatWidth="80px" gap="x4">
          {vertexTypes.map((vertexType, index) => (
            <VertexType
              uid={`vertexType/${index}`}
              key={vertexType}
              vertexType={vertexType}
              size={80}
            />
          ))}
        </Grid>
      </Section>

      <Section title={edgeTypes.length ? 'Edge types' : 'No edge types'}>
        <Grid repeatWidth="80px" gap="x4">
          {edgeTypes.map((edgeType, index) => (
            <EdgeType
              uid={`edgeType/${index}`}
              key={edgeType}
              edgeType={edgeType}
              size={80}
            />
          ))}
        </Grid>
      </Section>

      <Section title={shapeTypes.length ? 'Shape types' : 'No shape types'}>
        <Grid repeatWidth="80px" gap="x4">
          {shapeTypes.map((shapeType, index) => (
            <ShapeType
              uid={`shapeType/${index}`}
              key={shapeType}
              shapeType={shapeType}
              size={80}
            />
          ))}
        </Grid>
      </Section>

      <Section title={transforms.length ? 'Transforms' : 'No transforms'}>
        <Grid repeatWidth="160px" gap="x4">
          {transforms.map((transform, index) => (
            <TransformCard
              uid={`transform/${index}`}
              key={transform}
              path={path}
              transform={transform}
              size={160}
            />
          ))}
        </Grid>
      </Section>
    </Box>
  );
}
