import { Box, Motion, Text } from 'preshape';
import { PropsWithChildren } from 'react';

const startingRotations = Array.from({ length: 6 }).map(
  () => Math.random() * 360
);

export default function Spinner({ children }: PropsWithChildren) {
  return (
    <Box grow flex="vertical" alignChildren="middle">
      <Motion container width="60px" height="60px">
        {startingRotations.map((r, i) => (
          <Motion
            absolute="center"
            key={r}
            backgroundColor="text-shade-1"
            borderRadius="x2"
            height="4px"
            width="100%"
            animate={{
              rotate: [r, r + 360 * (i % 2 === 0 ? 1 : -1)],
              scale: [1, 1 - (r / 360) * 0.15, 1],
            }}
            initial={{
              originX: 0.5,
              originY: 0.5,
              x: '-50%',
              y: '-50%',
            }}
            transition={{
              duration: 1 + (r / 360) * 10,
              ease: 'linear',
              repeat: Infinity,
            }}
          />
        ))}
      </Motion>

      <Text margin="x6" monospace weight="x2">
        {children}
      </Text>
    </Box>
  );
}
