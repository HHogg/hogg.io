import { Text, TextProps } from 'preshape';
import React, { FC } from 'react';

const WritingParagraph: FC<TextProps> = (props) => {
  return <Text {...props} margin="x3" />;
};

export default WritingParagraph;
