import { Text, TextProps } from 'preshape';
import { FC } from 'react';

const WritingHeading: FC<TextProps> = (props) => {
  return <Text {...props} margin="x2" size="x6" weight="x2" />;
};

export default WritingHeading;
