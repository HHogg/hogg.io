import { useMatchMedia, Box } from 'preshape';
import React, { PropsWithChildren } from 'react';
import WritingSection, { Props as WritingSectionProps } from './WritingSection';

interface Props extends WritingSectionProps {
  maxWidth?: string;
}

const WritingFigs = (props: PropsWithChildren<Props>) => {
  const {
    backgroundColor = 'light-shade-1',
    children,
    maxWidth = '600px',
    textColor = 'dark-shade-1',
    ...rest
  } = props;
  const match = useMatchMedia([maxWidth]);

  return (
    <WritingSection
      {...rest}
      backgroundColor={backgroundColor}
      maxWidth={maxWidth}
      padding="x6"
      size="x3"
      textColor={textColor}
    >
      <Box flex={match(maxWidth) ? 'horizontal' : 'vertical'} gap="x6">
        {children}
      </Box>
    </WritingSection>
  );
};

export default WritingFigs;
