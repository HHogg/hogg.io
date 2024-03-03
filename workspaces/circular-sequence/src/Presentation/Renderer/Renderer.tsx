import { Box, BoxProps, Grid } from 'preshape';
import RendererSequence from './RendererSequence';
import { useRendererContext } from './useRendererContext';

export default function Renderer(props: BoxProps) {
  const { sequences } = useRendererContext();

  return (
    <Box {...props} grow flex="vertical">
      {sequences.map((sequence, index) => (
        <Box key={index}>
          <RendererSequence sequence={sequence} />
        </Box>
      ))}
    </Box>
  );
}
