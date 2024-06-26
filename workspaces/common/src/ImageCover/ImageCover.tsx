import { Box, BoxProps, useThemeContext } from 'preshape';

type ImageCoverProps = BoxProps & {
  srcDark?: string;
};

export default function ImageCover({
  height,
  src,
  srcDark: srcNight,
  style,
  theme: themeProps,
  ...rest
}: ImageCoverProps) {
  const { theme: themeContext } = useThemeContext();
  const theme = themeProps ?? themeContext;

  return (
    <Box {...rest} overflow="hidden">
      <Box
        backgroundColor="background-shade-2"
        height={height}
        theme={theme}
        style={{
          backgroundImage: `url(${theme === 'night' ? src : srcNight ?? src})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          filter: 'saturate(0) brightness(1) contrast(1)',
          ...style,
        }}
      />
    </Box>
  );
}
