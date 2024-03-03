import { Box, BoxProps, Text } from 'preshape';
import { PropsWithChildren, useEffect, useRef } from 'react';
import InView, { InViewProps } from '../InView/InView';
import { useArticleFigNumber } from './useArticleContext';

export type ArticleFigProps = InViewProps & {
  description: string;
  isActive?: boolean;
  onNumberChange?: (number: number) => void;
};

const ArticleFig = ({
  alignChildren = 'middle',
  children,
  description,
  flex,
  gap,
  padding = 'x6',
  onEnter,
  onNumberChange,
  ...rest
}: PropsWithChildren<ArticleFigProps & BoxProps>) => {
  const ref = useRef<HTMLElement>(null);
  const number = useArticleFigNumber(ref);

  useEffect(() => {
    onNumberChange?.(number);
  }, [onNumberChange, number]);

  return (
    <Box {...rest} basis="0" flex="vertical" grow minWidth="0" ref={ref}>
      <Box grow padding={padding}>
        <InView
          alignChildren={alignChildren}
          flex={flex}
          gap={gap}
          onEnter={onEnter}
        >
          {children}
        </InView>
      </Box>

      <Text
        align="middle"
        borderColor="background-shade-4"
        borderTop
        padding="x6"
      >
        <Text tag="span" weight="x2">
          Fig {number}.
        </Text>{' '}
        {description}
      </Text>
    </Box>
  );
};

export default ArticleFig;
