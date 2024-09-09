import { ArticlePage } from '@hogg/common';
import { ArticleSection, ArticleHeading } from 'preshape';

type Props = {};

const Article = ({}: Props) => {
  return (
    <ArticlePage>
      <ArticleSection>
        <ArticleHeading>Introduction</ArticleHeading>
      </ArticleSection>
    </ArticlePage>
  );
};

export default Article;
