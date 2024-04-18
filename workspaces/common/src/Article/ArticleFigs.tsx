import { ThemeProvider, ArticleSectionProps, ArticleSection } from 'preshape';
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
    textColor = 'text-shade-1',
    theme,
    ...rest
  } = props;

  return (
    <ThemeProvider theme={theme}>
      <ArticleSection
        {...rest}
        backgroundColor={backgroundColor}
        borderRadius="x3"
        borderColor="background-shade-4"
        borderSize="x1"
        flex="horizontal"
        size="x3"
        textColor={textColor}
        theme={theme}
        transitionProperty="filter"
        style={{
          filter: active
            ? 'drop-shadow(0 0 32px rgba(var(--rgb-accent-shade-4), 0.25)'
            : undefined,
        }}
        wrap
      >
        {children}
      </ArticleSection>
    </ThemeProvider>
  );
};

export default ArticleFigs;
