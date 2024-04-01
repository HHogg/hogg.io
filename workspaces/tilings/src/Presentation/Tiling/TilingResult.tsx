import { Link, LinkProps } from 'preshape';
import { useEffect, useState } from 'react';
import CroppedImage from '../Image/CroppedImage';
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
  const [filepath, setFilepath] = useState<string>('');
  const [, setError] = useState('');
  const withAnyInformation =
    withGomJauHogg || withCundyRollett || withUniform || withUniqueKey;

  // useEffect(() => {
  //   const filename = notation.replace(/\//g, ':');
  //   const filepath = import(`../../results/images/${filename}.png`);

  //   filepath
  //     .then((filepath) => {
  //       setError('');
  //       setFilepath(filepath.default);
  //     })
  //     .catch((error) => {
  //       setError(error.message);
  //       setFilepath('');
  //     });
  // }, [notation]);

  return (
    <Link {...rest}>
      <CroppedImage
        backgroundColor="background-shade-2"
        borderRadius={borderRadius}
        grow={height === undefined}
        height={height}
        scale={scale}
        src={filepath}
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
