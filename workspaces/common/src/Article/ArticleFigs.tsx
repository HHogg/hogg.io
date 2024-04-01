import {
  useMatchMedia,
  ThemeProvider,
  ArticleSectionProps,
  ArticleSection,
} from 'preshape';
import { PropsWithChildren } from 'react';

type Props = ArticleSectionProps & {
  active?: boolean;
  maxWidth?: string;
};

const ArticleFigs = (props: PropsWithChildren<Props>) => {
  const {
    active,
    backgroundColor = 'background-shade-2',
    children,
    maxWidth = '800px',
    textColor = 'text-shade-1',
    theme,
    ...rest
  } = props;
  const match = useMatchMedia([maxWidth]);

  return (
    <ThemeProvider theme={theme}>
      <ArticleSection
        {...rest}
        backgroundColor={backgroundColor}
        borderRadius="x3"
        borderColor="background-shade-4"
        borderSize="x1"
        flex={match(maxWidth) ? 'horizontal' : 'vertical'}
        maxWidth={maxWidth}
        size="x3"
        textColor={textColor}
        theme={theme}
        transitionProperty="filter"
        style={{
          filter: active
            ? 'drop-shadow(0 0 32px rgba(var(--rgb-accent-shade-4), 0.25)'
            : undefined,
        }}
      >
        {children}
      </ArticleSection>
    </ThemeProvider>
  );
};

export default ArticleFigs;
