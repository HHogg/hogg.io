import { Box } from 'preshape';
import { PropsWithChildren } from 'react';
import ArticleProvider from './ArticleProvider';

type Props = {};

const ArticlePage = (props: PropsWithChildren<Props>) => {
  return (
    <ArticleProvider>
      <Box {...props} grow tag="article" />
    </ArticleProvider>
  );
};

export default ArticlePage;
