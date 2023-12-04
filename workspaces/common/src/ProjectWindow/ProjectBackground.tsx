import { Box, BoxProps } from 'preshape';
import { PropsWithChildren } from 'react';

export type ProjectBackgroundProps = BoxProps & {
  pattern?: 'dots' | 'plain' | 'grid';
  patternGap?: number;
  patternSize?: number;
};

export default function ProjectBackground({
  backgroundColor,
  pattern = 'dots',
  patternGap: dotSpacing = 20,
  patternSize: dotSize = 1,
  ...rest
}: PropsWithChildren<BoxProps & ProjectBackgroundProps>) {
  const dotGradient =
    dotSize > 0
      ? `radial-gradient(rgba(var(--rgb-text-shade-1), 0.2) ${dotSize}px, transparent 0)`
      : 'none';
  const dotBackgroundSize = `${dotSpacing}px ${dotSpacing}px`;

  const gridGradient = `
    linear-gradient(90deg, rgba(var(--rgb-background-shade-4), 0.5) 1px, transparent 1px),
    linear-gradient(rgba(var(--rgb-background-shade-4), 0.5) 1px, transparent 1px)`;
  const gridBackgroundSize = `${dotSpacing}px ${dotSpacing}px`;

  const backgroundImage =
    (pattern === 'dots' && dotGradient) || (pattern === 'grid' && gridGradient);
  const backgroundSize =
    (pattern === 'dots' && dotBackgroundSize) ||
    (pattern === 'grid' && gridBackgroundSize);

  return (
    <Box
      {...rest}
      backgroundColor={backgroundColor}
      style={{
        backgroundImage: backgroundImage || '',
        backgroundSize: backgroundSize || '',
      }}
    />
  );
}
