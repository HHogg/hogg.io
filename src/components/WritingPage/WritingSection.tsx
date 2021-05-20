import * as React from 'react';
import { Text, TextProps } from 'preshape';

export interface Props extends TextProps {}

const WritingSection: React.FC<Props> = (props) => {
  const { maxWidth = '600px', ...rest } = props;

  return (
    <Text { ...rest }
        margin="x12"
        maxWidth={ maxWidth } />
  );
};

export default WritingSection;
