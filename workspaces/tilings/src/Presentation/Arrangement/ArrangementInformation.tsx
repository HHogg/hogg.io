import { Box, Grid, Text } from 'preshape';
import EdgeType from './EdgeType';
import ShapeType from './ShapeType';
import VertexType from './VertexType';
import { useArrangementContext } from './useArrangementContext';

export default function ArrangementInformation() {
  const { tiling } = useArrangementContext();

  return (
    <Box flex="vertical" gap="x16">
      <Box>
        <Text margin="x4" weight="x4">
          Vertex types
        </Text>

        <Grid repeatWidth="80px" gap="x4">
          {tiling?.polygons.vertexTypeStore.vertexTypes.map((vertexType) => (
            <VertexType
              key={vertexType}
              vertexType={vertexType}
              height="80px"
            />
          ))}
        </Grid>
      </Box>

      <Box>
        <Text margin="x4" weight="x4">
          Edge types
        </Text>

        <Grid repeatWidth="80px" gap="x4">
          {tiling?.polygons.edgeTypeStore.edgeTypes.map((edgeType) => (
            <EdgeType key={edgeType} edgeType={edgeType} height="80px" />
          ))}
        </Grid>
      </Box>

      <Box>
        <Text margin="x4" weight="x4">
          Shape types
        </Text>

        <Grid repeatWidth="80px" gap="x4">
          {tiling?.polygons.shapeTypeStore.shapeTypes.map((shapeType) => (
            <ShapeType key={shapeType} shapeType={shapeType} height="80px" />
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
