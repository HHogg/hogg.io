import { Link, LinkProps } from 'preshape';
import CroppedImage from '../Image/CroppedImage';
import { resultsImages } from '../utils/results';
import TilingInformation from './TilingInformation';

type Props = {
  notation: string;
  scale?: number;
  withGomJauHogg?: boolean;
  withCundyRollett?: boolean;
  withUniform?: boolean;
  withUniqueKey?: boolean;
};

export default function TilingCard({
  borderRadius,
  notation,
  height,
  scale = 1,
  style,
  withGomJauHogg,
  withCundyRollett,
  withUniform,
  withUniqueKey,
  ...rest
}: LinkProps & Props) {
  const withAnyInformation =
    withGomJauHogg || withCundyRollett || withUniform || withUniqueKey;

  return (
    <Link {...rest}>
      <CroppedImage
        backgroundColor="background-shade-2"
        borderRadius={borderRadius}
        grow={height === undefined}
        height={height}
        scale={scale}
        src={resultsImages[notation]}
        style={style}
      />

      {withAnyInformation && (
        <TilingInformation
          notation={notation}
          withGomJauHogg={withGomJauHogg}
          withCundyRollett={withCundyRollett}
          withUniform={withUniform}
          withUniqueKey={withUniqueKey}
        />
      )}
    </Link>
  );
}
