import { Article } from 'preshape';
import { PropsWithChildren } from 'react';
import ArticleProvider from './ArticleProvider';

type Props = {};

const ArticlePage = (props: PropsWithChildren<Props>) => {
  return (
    <ArticleProvider>
      <Article {...props} grow />
    </ArticleProvider>
  );
};

export default ArticlePage;
