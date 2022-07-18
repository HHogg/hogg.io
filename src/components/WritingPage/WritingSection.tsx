import { Text, TextProps } from 'preshape';
import React, {
  forwardRef,
  PropsWithChildren,
  RefForwardingComponent,
} from 'react';

export interface Props extends TextProps {}

const WritingSection: RefForwardingComponent<
  HTMLElement,
  PropsWithChildren<Props>
> = (props, ref) => {
  const { maxWidth = '600px', ...rest } = props;

  return (
    <Text {...rest} margin="x16" maxWidth={maxWidth} ref={ref} tag="div" />
  );
};

export default forwardRef(WritingSection);
