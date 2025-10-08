import { Lines, Media } from '@hogg/common';
import { Box, BoxProps } from 'preshape';
import PageChangeButton, { PageChangeButtonProps } from './PageChangeButton';

type Props = BoxProps & {
  previous?: Omit<PageChangeButtonProps, 'direction'>;
  next?: Omit<PageChangeButtonProps, 'direction'>;
};

export default function PageChangeButtons({ previous, next, ...rest }: Props) {
  return (
    <>
      {previous && next && <Lines count={3} size={4} />}
      <Box {...rest}>
        <Box alignChildrenVertical="middle" flex="horizontal" gap="x8" wrap>
          {previous && (
            <Media greaterThanOrEqual="desktop">
              <Box
                basis="0"
                flex="vertical"
                alignChildrenHorizontal="start"
                grow
                minWidth="300px"
              >
                <PageChangeButton
                  direction="previous"
                  title={previous.title}
                  description={previous.description}
                  to={previous.to}
                />
              </Box>
            </Media>
          )}

          {next && (
            <Box
              basis="0"
              flex="vertical"
              alignChildrenHorizontal="end"
              grow
              minWidth="300px"
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
      </Box>
    </>
  );
}
