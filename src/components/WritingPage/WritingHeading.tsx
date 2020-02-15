import * as React from 'react';
import { Text, TextProps } from 'preshape';

const WritingHeading: React.FC<TextProps> = (props) => {
  return (
    <Text { ...props } margin="x2" size="x3" strong />
  )
};

export default WritingHeading;
