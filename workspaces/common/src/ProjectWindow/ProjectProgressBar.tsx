import { Box, sizeX1Px } from 'preshape';

type Props = {
  elapsed: number;
};

export default function ProjectProgressBar({ elapsed }: Props) {
  return (
    <Box grow>
      <Box
        backgroundColor="text-shade-1"
        borderRadius="x3"
        container
        height={sizeX1Px}
        overflow="hidden"
      >
        <Box
          absolute="edge-to-edge"
          backgroundColor="accent-shade-3"
          style={{
            transform: `scaleX(${elapsed * 100}%)`,
            transformOrigin: 'left',
          }}
        />
      </Box>
    </Box>
  );
}
