import {
  useMatchMedia,
  ThemeProvider,
  ArticleSectionProps,
  ArticleSection,
} from 'preshape';
import { PropsWithChildren } from 'react';

type Props = ArticleSectionProps & {
  maxWidth?: string;
};

const ArticleFigs = (props: PropsWithChildren<Props>) => {
  const {
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
      >
        {children}
      </ArticleSection>
    </ThemeProvider>
  );
};

export default ArticleFigs;
