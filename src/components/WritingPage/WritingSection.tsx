import * as React from 'react';
import { Text, TextProps } from 'preshape';

interface Props extends TextProps {
  figure?: boolean;
}

const WritingSection: React.FC<Props> = (props) => {
  const {
    backgroundColor,
    figure,
    maxWidth = '600px',
    padding,
    size,
    ...rest
  } = props;

  return (
    <Text { ...rest }
        backgroundColor={ backgroundColor || (figure ? 'background-shade-2' : undefined) }
        margin="x12"
        maxWidth={ maxWidth }
        padding={ padding || (figure ? 'x6' : undefined) }
        size={ size || (figure ? 'x1' : undefined) }
        tag="div" />
  )
};

export default WritingSection;
