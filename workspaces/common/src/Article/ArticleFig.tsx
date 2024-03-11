import { Box, BoxProps, Text } from 'preshape';
import { PropsWithChildren, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import InView, { InViewProps } from '../InView/InView';
import { useArticleFigNumber } from './useArticleContext';

export type ArticleFigProps = InViewProps & {
  description: string;
  isActive?: boolean;
  onNumberChange?: (number: number) => void;
};

const ArticleFig = ({
  alignChildren,
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
  const location = useLocation();
  const id = `Fig${number}`;

  useEffect(() => {
    onNumberChange?.(number);
  }, [onNumberChange, number]);

  useEffect(() => {
    if (location.hash === `#${id}`) {
      ref.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  }, [id, location]);

  return (
    <Box
      {...rest}
      basis="0"
      flex="vertical"
      grow
      id={id}
      minWidth="0"
      ref={ref}
    >
      <Text
        align="middle"
        borderColor="background-shade-4"
        borderBottom
        padding="x6"
      >
        <Text tag="span" weight="x2">
          Fig {number}.
        </Text>{' '}
        {description}
      </Text>

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
    </Box>
  );
};

export default ArticleFig;
