import { Text, TextProps } from 'preshape';
import { forwardRef } from 'react';

export interface Props extends TextProps {}

export const WritingSection = forwardRef<HTMLDivElement, Props>(
  (props, ref) => {
    const { maxWidth = '600px', ...rest } = props;

    return (
      <Text {...rest} margin="x16" maxWidth={maxWidth} ref={ref} tag="div" />
    );
  }
);
