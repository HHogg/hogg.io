import { Box, BoxProps, TypeColor } from 'preshape';
import { PropsWithChildren } from 'react';

export type PatternBackgroundProps = BoxProps & {
  pattern?: 'dots' | 'plain' | 'grid';
  patternColor?: TypeColor;
  patternGap?: number;
  patternOpacity?: number;
  patternSize?: number;
};

export default function PatternBackground({
  backgroundColor,
  pattern = 'dots',
  patternColor = 'text-shade-3',
  patternGap: dotSpacing = 20,
  patternOpacity = pattern === 'dots' ? 0.2 : 0.05,
  patternSize: dotSize = 1,
  style,
  ...rest
}: PropsWithChildren<BoxProps & PatternBackgroundProps>) {
  const dotGradient =
    dotSize > 0
      ? `radial-gradient(rgba(var(--rgb-${patternColor}), ${patternOpacity}) ${dotSize}px, transparent 0)`
      : 'none';
  const dotBackgroundSize = `${dotSpacing}px ${dotSpacing}px`;

  const gridGradient = `
    linear-gradient(90deg, rgba(var(--rgb-${patternColor}), ${patternOpacity}) 1px, transparent 1px),
    linear-gradient(rgba(var(--rgb-${patternColor}), ${patternOpacity}) 1px, transparent 1px)`;
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
        ...style,
        backgroundImage: backgroundImage || '',
        backgroundSize: backgroundSize || '',
      }}
    />
  );
}
