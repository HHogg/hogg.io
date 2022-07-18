import { Text, TextProps } from 'preshape';
import * as React from 'react';

const WritingParagraph: React.FC<TextProps> = (props) => {
  return <Text {...props} margin="x3" />;
};

export default WritingParagraph;
