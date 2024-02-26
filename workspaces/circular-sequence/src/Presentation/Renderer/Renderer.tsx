import { Box, BoxProps, Grid } from 'preshape';
import RendererSequence from './RendererSequence';
import { useRendererContext } from './useRendererContext';

export default function Renderer(props: BoxProps) {
  const { sequences } = useRendererContext();

  return (
    <Box {...props} grow flex="vertical">
      <Grid
        grow
        repeatWidthMin="140px"
        repeatWidthMax="300px"
        gap="x6"
        alignChildren="middle"
      >
        {sequences.map((sequence, index) => (
          <RendererSequence key={index} sequence={sequence} />
        ))}
      </Grid>
    </Box>
  );
}
