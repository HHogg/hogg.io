import { Box, BoxProps, useThemeContext } from 'preshape';

type ImageCoverProps = BoxProps & {
  srcDark?: string;
};

export default function ImageCover({
  src,
  srcDark: srcNight,
  style,
  theme: themeProps,
  ...rest
}: ImageCoverProps) {
  const { theme: themeContext } = useThemeContext();
  const theme = themeProps ?? themeContext;

  return (
    <Box
      backgroundColor="text-shade-1"
      borderRadius="x1"
      borderSize="x1"
      borderColor="background-shade-4"
      padding="x2"
      {...rest}
    >
      <Box
        backgroundColor="background-shade-2"
        height="140px"
        theme={theme}
        style={{
          backgroundImage: `url(${theme === 'night' ? src : srcNight ?? src})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          filter:
            'grayscale(0.6) sepia(0.15) saturate(1) brightness(1) contrast(1)',
          ...style,
        }}
      />
    </Box>
  );
}
