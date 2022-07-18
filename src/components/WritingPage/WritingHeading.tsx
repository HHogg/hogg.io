import { Text, TextProps } from 'preshape';
import * as React from 'react';

const WritingHeading: React.FC<TextProps> = (props) => {
  return <Text {...props} margin="x2" size="x5" strong />;
};

export default WritingHeading;
