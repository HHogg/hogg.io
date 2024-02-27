import { Box, BoxProps, useMatchMedia } from 'preshape';
import Lines from '../Lines/Lines';
import PageChangeButton, { PageChangeButtonProps } from './PageChangeButton';

type Props = BoxProps & {
  previous?: Omit<PageChangeButtonProps, 'direction'>;
  next?: Omit<PageChangeButtonProps, 'direction'>;
};

const maxWidth = '1200px';

export default function PageChangeButtons({ previous, next, ...rest }: Props) {
  const match = useMatchMedia([maxWidth]);

  return (
    <Box {...rest}>
      <Lines
        backgroundColor="text-shade-1"
        count={2}
        size={5}
        grow
        margin="x2"
      />

      <Box
        alignChildrenVertical="middle"
        flex={match(maxWidth) ? 'horizontal' : 'vertical'}
        gap={match(maxWidth) ? 'x16' : 'x2'}
      >
        {previous && (
          <Box
            flex="vertical"
            alignChildrenHorizontal="start"
            paddingVertical={match(maxWidth) ? undefined : 'x10'}
          >
            <PageChangeButton
              direction="previous"
              title={previous.title}
              description={previous.description}
              to={previous.to}
            />
          </Box>
        )}

        <Lines
          backgroundColor="text-shade-1"
          count={match(maxWidth) ? 12 : 4}
          size={5}
          grow
        />

        {next && (
          <Box
            flex="vertical"
            alignChildrenHorizontal="end"
            paddingVertical={match(maxWidth) ? undefined : 'x10'}
          >
            <PageChangeButton
              direction="next"
              title={next.title}
              description={next.description}
              to={next.to}
            />
          </Box>
        )}
      </Box>

      <Lines
        backgroundColor="text-shade-1"
        count={2}
        size={5}
        grow
        margin="x2"
      />
    </Box>
  );
}
