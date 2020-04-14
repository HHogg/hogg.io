import * as React from 'react';
import { Text, TextProps } from 'preshape';

const WritingParagraph: React.FC<TextProps> = (props) => {
  return (
    <Text { ...props } margin="x3" />
  );
};

export default WritingParagraph;
