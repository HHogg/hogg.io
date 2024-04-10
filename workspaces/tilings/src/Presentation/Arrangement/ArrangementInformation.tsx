import { Box, Grid, Text } from 'preshape';
import VertexType from './VertexType';
import { useArrangementContext } from './useArrangementContext';

export default function ArrangementInformation() {
  const { tiling } = useArrangementContext();

  console.log(tiling);

  return (
    <Box flex="vertical" gap="x4">
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
    </Box>
  );
}
