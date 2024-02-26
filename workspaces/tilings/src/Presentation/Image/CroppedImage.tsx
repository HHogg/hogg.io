import { Box, BoxProps } from 'preshape';
import './CroppedImage.css';

type Props = {
  scale?: number;
};

export default function CroppedImage(props: BoxProps & Props) {
  const { scale = 1, src, ...rest } = props;

  return (
    <Box {...rest} container overflow="hidden">
      <Box
        absolute="edge-to-edge"
        className="CroppedImage--image"
        transitionProperty="transform"
        style={{
          '--CroppedImage--scale': scale,
          backgroundImage: src && `url('${src}')`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      />
    </Box>
  );
}
