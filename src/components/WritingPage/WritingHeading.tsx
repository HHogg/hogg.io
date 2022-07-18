import { Text, TextProps } from 'preshape';
import React, { FC } from 'react';

const WritingHeading: FC<TextProps> = (props) => {
  return <Text {...props} margin="x2" size="x6" strong />;
};

export default WritingHeading;
