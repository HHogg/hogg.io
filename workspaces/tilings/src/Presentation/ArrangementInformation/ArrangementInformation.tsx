import { CopyToClipboardCard } from '@hogg/common';
import { Box, BoxProps, Grid, Text } from 'preshape';
import { usePlayerContext } from '../Player/usePlayerContext';
import EdgeType from './EdgeType';
import ShapeType from './ShapeType';
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
              height="80px"
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
              height="80px"
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
              height="80px"
            />
          ))}
        </Grid>
      </Section>
    </Box>
  );
}
