import { CopyToClipboardCard } from '@hogg/common';
import { Box, BoxProps, Grid, Text } from 'preshape';
import EdgeType from './EdgeType';
import ShapeType from './ShapeType';
import VertexType from './VertexType';
import { useArrangementContext } from './useArrangementContext';

const Section = ({ children, title, ...rest }: BoxProps) => (
  <Box {...rest}>
    <Text margin="x4" weight="x4">
      {title}
    </Text>
    {children}
  </Box>
);

export default function ArrangementInformation() {
  const { tiling } = useArrangementContext();

  const validTiling = tiling?.buildContext.results[0];
  // const vertexTypes =
  //   tiling?.plane.classifier.vertexTypeStore.vertexTypes ?? [];
  // const edgeTypes = tiling?.plane.classifier.edgeTypeStore.edgeTypes ?? [];
  // const shapeTypes = tiling?.plane.classifier.shapeTypeStore.shapeTypes ?? [];

  return (
    <Box flex="vertical" gap="x8">
      {validTiling && (
        <>
          <Section title="Notation">
            <CopyToClipboardCard text={validTiling.notation} size="x2" />
          </Section>

          <Section title="Hash">
            <CopyToClipboardCard text={validTiling.hash} size="x2" />
          </Section>
        </>
      )}

      {/* <Section title={vertexTypes.length ? 'Vertex types' : 'No vertex types'}>
        <Grid repeatWidth="80px" gap="x4">
          {vertexTypes.map((vertexType) => (
            <VertexType
              key={vertexType}
              vertexType={vertexType}
              height="80px"
            />
          ))}
        </Grid>
      </Section>

      <Section title={edgeTypes.length ? 'Edge types' : 'No edge types'}>
        <Grid repeatWidth="80px" gap="x4">
          {edgeTypes.map((edgeType) => (
            <EdgeType key={edgeType} edgeType={edgeType} height="80px" />
          ))}
        </Grid>
      </Section>

      <Section title={shapeTypes.length ? 'Shape types' : 'No shape types'}>
        <Grid repeatWidth="80px" gap="x4">
          {shapeTypes.map((shapeType) => (
            <ShapeType key={shapeType} shapeType={shapeType} height="80px" />
          ))}
        </Grid>
      </Section> */}
    </Box>
  );
}
