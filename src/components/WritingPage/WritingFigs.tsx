import * as React from 'react';
import { useMatchMedia, Flex } from 'preshape';
import WritingSection, { Props as WritingSectionProps } from './WritingSection';

interface Props extends WritingSectionProps {
  maxWidth?: string;
}

export default (props: React.PropsWithChildren<Props>) => {
  const {
    backgroundColor = 'light-shade-1',
    children,
    maxWidth = '600px',
    textColor = 'dark-shade-1',
    ...rest
  } = props;
  const match = useMatchMedia([maxWidth]);

  return (
    <WritingSection { ...rest }
        backgroundColor={ backgroundColor }
        maxWidth={ maxWidth }
        padding="x6"
        size="x1"
        textColor={ textColor }>
      <Flex
          direction={ match(maxWidth) ? 'horizontal' : 'vertical' }
          gap="x6">
        { children }
      </Flex>
    </WritingSection>
  );
};
